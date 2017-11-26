import React, { Component } from 'react';
import createHistory from 'history/createHashHistory';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Snackbar from 'material-ui/Snackbar';
const history = createHistory();

const styles = {
	FB: {
		marginLeft: 10
	},
	toolBar:{
		backgroundColor:'#e3f2fd'
	}
};

export default class MailTools extends Component {
	constructor(props) {
		super(props);
		this.state= {
			values: [],
			tags:[],
			snackOpen: false,
			message: ""
		}
		this.handleChange = (event, index, values) => this.setState({values});
	}

	componentDidMount() {
		this.fetchTag();
	}

	fetchTag() {
		fetch('/api/tag/list', {
			method: 'GET',
			credentials: 'include'
		}).then((res) => {
			return res.json();
		}).then((data) => {
			this.setState({ tags: data.result.tags});
		}).catch((e) => {
			console.log('解析失败', e);
		});
	}

	addTag() {
		fetch('/api/mail/tagSave', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
      	mid: location.hash.split("?")[1].split("=")[1],
      	tags: this.state.values
      })
    }).then((res) => {
      return res.json();
    }).then((result) => {
      if(!result.err){
        this.setState({snackOpen: true, message: result.message});
      	this.props.refresh();
      } else {
        this.setState({snackOpen: true, message: result.errInfo});
      }
    }).catch(function(ex) {
      console.log('解析失败', ex);
    });
	}

	render() {
		return (
			<Toolbar style={styles.toolBar}>
				<ToolbarGroup firstChild={true} style={styles.FB}>
				<SelectField
		        multiple={true}
		        hintText="标记为"
		        hintStyle={{color:"red"}}
		        value={this.state.values}
		        onChange={this.handleChange}
		      >
		        {this.state.tags.map((tag) => (
				      <MenuItem
				        key={tag._id}
				        insetChildren={true}
				        checked={this.state.values && this.state.values.indexOf(tag.name) > -1}
				        value={tag.name}
				        primaryText={tag.name}
				      />
				    ))}
  			</SelectField>
  			<FlatButton label="确定"  secondary={true} style={styles.FB} onTouchTap={this.addTag.bind(this)}/>
				</ToolbarGroup>
				<Snackbar
          open={this.state.snackOpen}
          message={this.state.message}
          autoHideDuration={2000}
        />
			</Toolbar>
		);
	}
}