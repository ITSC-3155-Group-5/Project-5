/* eslint-disable react/jsx-wrap-multilines, implicit-arrow-linebreak, react/jsx-curly-newline */
import React from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter, Route, Switch
} from 'react-router-dom';
import {
  Grid, Paper
} from '@mui/material';
import './styles/main.css';

import {Redirect} from "react-router";

// import necessary components
import TopBar from './components/topBar/TopBar';
import UserDetail from './components/userDetail/userDetail';
import UserList from './components/userList/userList';
import UserPhotos from './components/userPhotos/userPhotos';
import LoginRegister from "./components/loginRegister/loginRegister";

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    const savedUser = localStorage.getItem('user');
    this.state = {
      main_content: undefined,
      user: savedUser ? JSON.parse(savedUser) : undefined // Restore user if available
    };
    this.changeMainContent = this.changeMainContent.bind(this);
    this.changeUser = this.changeUser.bind(this);
  }

  userIsLoggedIn(){
    return this.state.user !== undefined;
  }
  changeMainContent = (main_content) => {
    this.setState({ main_content: main_content });
  };

  changeUser = (user) => {
    this.setState({user: user});
    if (user === undefined) {
      localStorage.removeItem('user'); // Clear user data on logout
      this.changeMainContent(undefined);
    } else {
      localStorage.setItem('user', JSON.stringify(user)); // Save user data on login
    }
  };

  componentDidMount() {
    this.serverCheckInterval = setInterval(() => {
      fetch('/session', { method: 'GET', credentials: 'include' })
        .then((response) => {
          if (response.status !== 200) {
            throw new Error('Server unavailable');
          }
        })
        .catch(() => {
          this.changeUser(undefined); // Log out the user if the server is unavailable
        });
    }, 5000); // Check every 5 seconds
  }
  
  componentWillUnmount() {
    clearInterval(this.serverCheckInterval); // Clear the interval when the component unmounts
  }

  render() {
    return (
      <HashRouter>
      <div>
      <Grid container spacing={8}>
        <Grid item xs={12}>
          <TopBar main_content={this.state.main_content} user={this.state.user} changeUser={this.changeUser}/>
        </Grid>
        <div className="main-topbar-buffer"/>
        <Grid item sm={3}>
          <Paper className="main-grid-item">
            {
              this.userIsLoggedIn() ? <UserList/> : <div></div>
            }
          </Paper>
        </Grid>
        <Grid item sm={9}>
          <Paper className="main-grid-item">
            <Switch>
              {
                this.userIsLoggedIn() ?
                    <Route path="/users/:userId" render={props => 
                      <UserDetail 
                        {...props}
                        changeMainContent={this.changeMainContent}
                        loggedInUserId={this.state.user ? this.state.user._id : null}
                      />
                    }/>                
                    :
                    <Redirect path="/users/:userId" to="/login-register" />
              }
              {
                this.userIsLoggedIn() ?
                    <Route path="/photos/:userId" render ={ props => <UserPhotos {...props} changeMainContent={this.changeMainContent}/> }/>
                    :
                    <Redirect path="/photos/:userId" to="/login-register" />
              }
              {
                this.userIsLoggedIn() ?
                    <Route path="/" render={() => (<div/>)}/>
                    :
                    <Route path="/login-register" render ={ props => <LoginRegister {...props} changeUser={this.changeUser}/> } />
              }
               {
                this.userIsLoggedIn() ?
                    <Route path="/" render={() => (<div/>)}/>
                    :
                    <Route path="/" render ={ props => <LoginRegister {...props} changeUser={this.changeUser}/> } />
              }

            </Switch>
          </Paper>
        </Grid>
      </Grid>
      </div>
      </HashRouter>
    );
  }
}

ReactDOM.render(
  <PhotoShare/>,
  document.getElementById('photoshareapp')
);