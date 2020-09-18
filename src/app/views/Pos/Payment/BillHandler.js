import React, { Component } from 'react';
import Statusbutton from '../../../components/StatusButton'
import { DataContext } from '../../../LocalDB'
import { connect } from 'react-redux'
import { OTLayout, BillLayout } from './PrintLayoyt'
import { ClientData } from '../../../LocalDB/ClientDB'
import { Grid } from '@material-ui/core';
import ReceiptIcon from '@material-ui/icons/Receipt';
import SaveIcon from '@material-ui/icons/Save';

import { datetime, date, time } from '../../../Utils'
import { StoreKot, ClearKot } from '../../../store/action/Kot'

class BillHandler extends Component {
    constructor(props) {
        super(props)
        this.state = {
            Active: {},
            isSave: false,
            buttonStutas: 'Inactive',
            loading: false
        }
        this.GenOTPrintLayout = this.GenOTPrintLayout.bind(this);
        this.SaveCart = this.SaveCart.bind(this);
        this.PrintBill = this.PrintBill.bind(this);
    }

    GenOTPrintLayout(Data) {
        let tableBody = []
        Data.Ot.forEach(element => {
            tableBody.push({ Item: element.Name, Qnt: element.PrintQnt, _id: element._id })
        });
        const PrintData = {
            header: 'Order Tiket',
            DateTime: datetime(),
            subHeader: `${Data.Type} - ${Data.displayNo}`,
            barCode: `${Data.OTSno}-${Data.OTPrint}`,
            tableHeader: ['Item', 'Qnt'],
            tableBody: tableBody
        }
        return OTLayout(PrintData)
    }

    async SaveCart() {
        const { editItem } = this.context
        const { PrintPos } = this.props
        const { Active } = this.props.Cart
        const { ShopData } = this.props.Shop
        const generator = require('generate-serial-number')
        return new Promise((resolve, reject) => {
            if (Active.Cart.length !== 0) {
                const newActive = Object.assign(Active, {
                    Cart: Active.Cart,
                    OTPrint: Active.OTPrint + 1,
                    Ot: Active.Ot,
                    Stutas: Active.Stutas,
                    isActive: true,
                    OTSno: Active.OTSno || generator.generate(10)
                })
                editItem(Active._id, newActive).then(() => {
                    
                    const PrintData = this.GenOTPrintLayout(newActive)
                    if (Active.Ot.length !== 0) {
                        console.log(Active.Ot)
                        this.props.StoreKot(Active._id, `${newActive.OTSno}-${newActive.OTPrint}`, Active.Ot, date(), time())
                        const UpdateOT = Object.assign(newActive, { Ot: [] })
                        if (Active.Stutas === "Inactive") {
                            editItem(Active.ClientId, { table_Status: 'Active' })
                            editItem(newActive._id, UpdateOT).then(() => {
                                resolve()
                            })
                            if (ShopData) {
                                if (ShopData.OT) {
                                    if (ShopData.OT.print) {
                                        PrintPos(PrintData, 'OT')
                                    }
                                }
                            }
                        
                        } else {
                            editItem(newActive._id, UpdateOT).then(() => {
                                resolve()
                            })
                            if (ShopData) {
                                if (ShopData.OT) {
                                    if (ShopData.OT.print) {
                                        PrintPos(PrintData, 'OT')
                                    }
                                }
                            }
                            
                        }
                    }
                }).catch((error) => {
                    reject(error)
                    this.setState({ loading: false })
                });

            }
        })

    }
    PrintBill() {
        const { PrintPos } = this.props
        const { Active } = this.props.Cart
        const { ShopData } = this.props.Shop
        const { editItem, addItem } = this.context
        const { Kot } = this.props.kot
        if (Active.Cart.length !== 0) {
            if (Active.Ot.length === 0) {
                this.setState({ loading: true })
                let tableBody = []
                Active.Cart.forEach(element => {
                    tableBody.push({ Item: element.Name, Qnt: element.cartQnt, _id: element._id, SubTotal: element.cartQnt * element.Price })
                });
                let clienId = `ORDER NO - ${Active.displayNo}`
                if (Active.Type === "Table") {
                    clienId = `TABLE NO - ${Active.displayNo}`
                }

                let Tax = 0
                let net = 0
                let Dis = 0
                Active.Cart.forEach(element => {
                    net = net + element.cartQnt * element.Price
                    if (element.Tax_Include === false && element.Tax_Percent) {
                        Tax = Tax + ((element.cartQnt * element.Price) * element.Tax_Percent / 100)
                    }
                });

                if (Active.discount) {
                    if (Active.discount === true) {
                        if (Active.Discount) {
                            Dis = Active.Discount
                        }
                        if (Active.Percent) {
                            Dis = (Tax + net) * Active.Discount / 100
                        }
                    }
                }
                const PrintData = {
                    header: ShopData.Name.toUpperCase(),
                    DateTime: datetime(),
                    subHeader: "BILL",
                    ClientID: clienId,
                    barCode: `${Active.OTSno}`,
                    Contact: { address: ShopData.Location, contact: ShopData.Contact },
                    tableHeader: ['Item', 'Qnt', 'SubTotal'],
                    tableBody: tableBody,
                    netAmount: Number(net),
                    tax: Number(Tax),
                    discount: Number(Dis),
                    total: Number(net + Tax - Dis),
                    complementary: Active.free || false
                }
                const Bill = BillLayout(PrintData)
                let newOrderTicket
                if (Kot[Active._id]) {
                    let OrderTicket = Kot[Active._id]
                    newOrderTicket = Object.assign(OrderTicket, { OrderName: Active.displayNo, OrderType: Active.Type })
                }

                if (Active.Stutas === "Active" || Active.Stutas === "Inactive") {
                    editItem(Active.ClientId, { table_Status: 'Pending' }).then(() => {
                        if (ShopData) {
                            if (ShopData.Bill) {
                                if (ShopData.Bill.print) {
                                    PrintPos(Bill, 'Bill')
                                }
                            }
                        }
                    })
                    if (Kot[Active._id]) {
                        addItem('OrderTicket', newOrderTicket).then(() => {
                            this.props.ClearKot(Active._id)

                        })
                    }
                    this.setState({ loading: false })
                } else {
                    if (Kot[Active._id]) {
                        addItem('OrderTicket', newOrderTicket).then(() => {
                            this.props.ClearKot(Active._id)
                            if (ShopData) {
                                if (ShopData.Bill) {
                                    if (ShopData.Bill.print) {
                                        PrintPos(Bill, 'Bill')
                                    }
                                }
                            }
                        })
                    } else {
                        if (ShopData) {
                            if (ShopData.Bill) {
                                if (ShopData.Bill.print) {
                                    PrintPos(Bill, 'Bill')
                                }
                            }
                        }
                    }
                    this.setState({ loading: false })
                }
            } if (Active.Ot.length !== 0) {
                this.setState({ loading: true })
                this.SaveCart().then(() => {

                    let tableBody = []
                    Active.Cart.forEach(element => {
                        tableBody.push({ Item: element.Name, Qnt: element.cartQnt, _id: element._id, SubTotal: element.cartQnt * element.Price })
                    });
                    let clienId = `ORDER NO - ${Active.displayNo}`
                    if (Active.Type === "Table") {
                        clienId = `TABLE NO - ${Active.displayNo}`
                    }

                    let Tax = 0
                    let net = 0
                    let Dis = 0
                    Active.Cart.forEach(element => {
                        net = net + element.cartQnt * element.Price
                        if (element.Tax_Include === false && element.Tax_Percent) {
                            Tax = Tax + ((element.cartQnt * element.Price) * element.Tax_Percent / 100)
                        }
                    });
                    if (Active.discount) {
                        if (Active.discount === true) {
                            if (Active.Discount) {
                                Dis = Active.Discount
                            }
                            if (Active.Percent) {
                                Dis = (Tax + net) * Active.Discount / 100
                            }
                        }
                    }

                    const PrintData = {
                        header: ShopData.Name.toUpperCase(),
                        DateTime: datetime(),
                        subHeader: "BILL",
                        ClientID: clienId,
                        barCode: `${Active.OTSno}`,
                        Contact: { address: ShopData.Location, contact: ShopData.Contact },
                        tableHeader: ['Item', 'Qnt', 'SubTotal'],
                        tableBody: tableBody,
                        netAmount: Number(net),
                        tax: Number(Tax),
                        discount: Number(Dis),
                        total: Number(net + Tax - Dis),
                        complementary: Active.free || false
                    }
                    const Bill = BillLayout(PrintData)
                    let newOrderTicket
                    if (Kot[Active._id]) {
                        let OrderTicket = Kot[Active._id]
                        newOrderTicket = Object.assign(OrderTicket, { OrderName: Active.displayNo, OrderType: Active.Type })
                    }

                    if (Active.Stutas === "Active" || Active.Stutas === "Inactive") {
                        editItem(Active.ClientId, { table_Status: 'Pending' }).then(() => {
                            if (ShopData) {
                                if (ShopData.Bill) {
                                    if (ShopData.Bill.print) {
                                        PrintPos(Bill, 'Bill')
                                    }
                                }
                            }
                        })
                        if (Kot[Active._id]) {
                            addItem('OrderTicket', newOrderTicket).then(() => {
                                this.props.ClearKot(Active._id)

                            })
                        }
                        this.setState({ loading: false })
                    } else {
                        if (Kot[Active._id]) {
                            addItem('OrderTicket', newOrderTicket).then(() => {
                                this.props.ClearKot(Active._id)
                                if (ShopData) {
                                    if (ShopData.Bill) {
                                        if (ShopData.Bill.print) {
                                            PrintPos(Bill, 'Bill')
                                        }
                                    }
                                }
                            })
                        } else {
                            if (ShopData) {
                                if (ShopData.Bill) {
                                    if (ShopData.Bill.print) {
                                        PrintPos(Bill, 'Bill')
                                    }
                                }
                            }
                        }
                        this.setState({ loading: false })
                    }
                })
            }

        }

    }
    render() {
        const { Active } = this.props.Cart
        const { lodding, dataload } = this.props.data
        return (
            <ClientData>
                {() => (
                    <>
                        {
                            Active.isActive ?
                                <Grid item xs={4}>
                                    <Statusbutton
                                        label='Save'
                                        onClick={() => {
                                            if (dataload) {
                                                this.SaveCart()
                                            }
                                        }}
                                        loading={lodding}
                                        status={Active.Ot.length !== 0 ? 'Active' : 'Banned'}
                                        Sublabel={'Save 0'}
                                        src={<SaveIcon />}
                                    />

                                </Grid>
                                :
                                <Grid item xs={4}>
                                    <Statusbutton
                                        label='Save'
                                        onClick={() => {
                                            if (dataload) {
                                                this.SaveCart()
                                            }
                                        }}
                                        loading={lodding}
                                        Sublabel={'Save 0'}
                                        src={<SaveIcon />}
                                    />

                                </Grid>
                        }
                        <Grid item xs={4}>
                            < Statusbutton
                                label='Print Bill'
                                onClick={() => this.PrintBill()}
                                status={"info"}
                                Sublabel={'TOTAL Item 0'}
                                src={<ReceiptIcon />}
                                loading={this.state.loading}
                            />

                        </Grid>
                        
                    </>
                )}
            </ClientData>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        Cart: state.Cart,
        data: state.DataStore,
        Shop: state.Shop,
        kot: state.Kot
    }
}
BillHandler.contextType = DataContext

export default connect(mapStateToProps, { StoreKot, ClearKot })(BillHandler) 