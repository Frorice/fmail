import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import Divider from 'material-ui/Divider';

const  styles = {
	paper: {
		display: 'inline-block',
		margin: '16px 32px 16px 32px',
		verticalAlign: 'top',
		width:'280px'
	},
	editButton: {
		width:'260px',
		margin: '10px'
	}
}

export default class SideMenu extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<Paper style={styles.paper}>
				<Link to="/editmail?mid=new"><RaisedButton label="写邮件"  secondary={true}  style={styles.editButton}/></Link>
				<Divider />
				<Menu style={styles.menu}>
	        <Link to="/maillist/1"><MenuItem primaryText="收件箱" /></Link>
	        <Link to="/maillist/2"><MenuItem primaryText="已发邮件" /></Link>
	        <Link to="/maillist/3"><MenuItem primaryText="草稿箱" /></Link>
	        <Link to="/addressbook"><MenuItem primaryText="通讯录" /></Link>
	      	<Link to="/category"><MenuItem primaryText="分类邮件" /></Link>
	      </Menu>
	    </Paper>
		);
	}
}