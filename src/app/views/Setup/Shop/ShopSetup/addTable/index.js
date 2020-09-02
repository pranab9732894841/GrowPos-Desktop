import React, { Component } from 'react';
import { Input, Button } from '../../../../LayoutManeger/FormManager'
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import { DataContext, DataConsumer } from '../../../../../LocalDB'
import Typography from '@material-ui/core/Typography';
import ClientButton from '../../../../LayoutManeger/ClientButton'
import {danger , info} from '../../../../LayoutManeger/Themes'
const style = theme => ({
    heading: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '40%',
        flexShrink: 0,
        paddingBottom: 5,
    },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
    },
    alart: {
        fontSize: theme.typography.pxToRem(15),
        color: danger,
    },
    new: {
        fontSize: theme.typography.pxToRem(15),
        color: info,
    }
});
class AddTable extends Component {
    constructor(props) {
        super(props)
        this.state = {
            No: '',
        }
        this.handleChange = this.handleChange.bind(this);
        this.handlesubmit = this.handlesubmit.bind(this);
        this.handleReset = this.handleReset.bind(this);
    }
    componentDidMount() {
    }
    handleReset() {
        this.setState({
            No: '',
        });
        console.log('ClientButton')
    }
    handleChange(e) {
        const { name, value } = e.target;
        this.setState({ [name]: value });
    }
    handlesubmit() {
        const { No } = this.state
        const data = {
            No: No,
            table_Status: 'Inactive'
        }
        if (No) {
            this.context.addItem('Tables', data)
        }
    };
    render() {
        const { No } = this.state
        var nikename = false
        if (No) {
            nikename = true
        }
        const { Tables } = this.context
        const [filter] = Tables.filter(item => item.No === No)
        const tableExsits = () => {
            if (filter) {
                return true
            } else {
                return false
            }
        }
        const { classes } = this.props;
        return (
            <DataConsumer>
                {({ deleteItem }) => (
                    <Grid container spacing={2}>
                        <Grid item xs={5} sm={5}>
                            <Grid container spacing={1}>
                                <Grid item xs={12} sm={12} style={{ marginTop: '5px' }}>
                                    <Input
                                        name="No"
                                        label="Table No"
                                        type="number"
                                        value={No}
                                        onChange={this.handleChange}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={6} sm={6} style={{ borderLeft: '1px solid #f0f0f0' }}>
                            <Grid container spacing={1}>
                                <Grid item xs={12} sm={12} >
                                    <Typography className={classes.heading}>TABLE MANAGER </Typography>
                                    {nikename ?
                                        <>
                                            <Grid container>
                                                <Grid item xs={6} sm={6}>
                                                    <ClientButton
                                                        onClick={this.handleReset}
                                                        label={tableExsits() ? `TABLE ${filter.No}` : `TABLE ${No}`}
                                                        status={tableExsits() && filter.table_Status}
                                                        Type='Table'
                                                        size={110}
                                                    />
                                                </Grid>
                                                <Grid item xs={6} sm={6}>
                                                    {tableExsits() ?
                                                    <Typography className={classes.alart}>This Table Alredy Exists!</Typography>
                                                    :
                                                    <Typography className={classes.new}>Create new Table!</Typography>
                                                    }
                                                </Grid>
                                            </Grid>
                                        </> :
                                        <>
                                            <Typography className={classes.secondaryHeading}>Input A table No to Cheak Statas </Typography>
                                            <Typography className={classes.secondaryHeading}>Add tables  OR Delete tables</Typography>
                                        </>
                                    }
                                </Grid>
                            </Grid>
                        </Grid>
                        <div>
                            {tableExsits() ?
                                <Button
                                    type="delete"
                                    text="Delete"
                                    color="danger"
                                    onClick={() => deleteItem(filter._id)}

                                /> :
                                <Button
                                    type="submit"
                                    text="Submit"
                                    color="primary"
                                    onClick={this.handlesubmit}
                                />
                            }
                            <Button
                                text="Reset"
                                color="default"
                                onClick={this.handleReset}
                            />
                        </div>
                    </Grid>
                )}
            </DataConsumer>
        )
    }
}

AddTable.contextType = DataContext

export default withStyles(style, { withTheme: true })(AddTable);