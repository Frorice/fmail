import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route, Redirect} from 'react-router-dom'

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import MailList from './maillist.js';
import MailDetail from './maildetail.js';
import SideMenu from './sidemenu.js';
import AddressBook from './addressbook.js';
import HeaderBar from './headerbar.js';
import EmailEditor from './emaileditor.js';
import Category from './category.js';
import Sign from './sign.js';

import 'whatwg-fetch';

import injectTapEventPlugin from 'react-tap-event-plugin';

injectTapEventPlugin();

const styles= {
	main: {
		width: '1376px',
		margin: '0 auto'
	}
}

const index = (<div>	
	<HeaderBar />
	<div style={styles.main} >	
		<SideMenu />
		<Redirect to="maillist/1" />
    <Route exact path="/maillist/:id" component={MailList} />
    <Route path="/addressbook" component={AddressBook} />
    <Route path="/maildetail" component={MailDetail} />
    <Route path="/editmail" component={EmailEditor} />
    <Route path="/category" component={Category} />
	</div>
</div>);

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			app: null
		};
	}

	onLogin() {
		this.setState({app:index});
	}

	componentDidMount() {
		fetch('/api/user/logged', {
			method: 'GET',
			credentials: 'include'
		}).then((res) => {
			return res.json();
		}).then((result) => {
			let app = result.logged
				? index
				: (<Sign onLogin={this.onLogin.bind(this)}/>);
			this.setState({app: app});
		}).catch(function(ex) {
    	console.log('解析失败', ex);
  	})
	}

	render() {
		return (
			<MuiThemeProvider>
				{this.state.app}
			</MuiThemeProvider>
		)
	}
}

ReactDOM.render((
  <HashRouter>
    <Route path="/" component={App}/>
  </HashRouter>
  ),document.getElementById('app')
);