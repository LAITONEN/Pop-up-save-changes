/* eslint-disable react/no-multi-comp */

import React from 'react';
import firebase from "firebase";
// Required for side-effects
import "firebase/firestore";
import u from 'updeep'


import PromptDialog from './PromptDialog'
import { getType } from './utilities';

// 1. Style the colors of the button.

const config = {
  apiKey: 'AIzaSyAHx3ffC4YxbwZoRIJ_X-MvQM_YR4_O8rE',
  authDomain: 'localhost',
  databaseURL: "https://crowst-dialogs.firebaseio.com/",
  projectId: 'crowst-dialogs',
  // storageBucket: "<BUCKET>.appspot.com",
  // messagingSenderId: "<SENDER_ID>",
}

firebase.initializeApp(config);

var db = firebase.database();
const usersRef = db.ref('users/')

class App extends React.Component {

  state = {
    user: {
      name: null,
      id: null
    }
  }

  async componentDidMount() {
    const resultsRef = firebase.database().ref(`results/`)
    const snapshot = await resultsRef.once('value')
    const allResults = snapshot.val()
    let newResults = {}
    for (let userId in allResults) {
      newResults[userId] = {}
      for (let resultIndex in allResults[userId]) {
        const result = allResults[userId][resultIndex]
        if (result.content.primaryText.includes('?')) {
          if (result.type === 'questionElaboration') newResults[userId][resultIndex] = result
          else {
            console.log('change - ', allResults[userId][resultIndex])
            newResults[userId][resultIndex] = {
              ...result,
              type: 'questionElaboration'
            }
          }
        }
        else if (result.content.secondaryText.includes('?')) {
          if (result.type === 'statementQuestion') {
            newResults[userId][resultIndex] = result
          }
          else {
            console.log('change - ', allResults[userId][resultIndex])
            newResults[userId][resultIndex] = {
              ...result,
              type: 'statementQuestion'
            }
          }
        }
      }
      /*  for (let userId in newResults) {
   
       }
       for each newResult push
       resultsRef. */
    }
  }

  saveResults = async (results) => {
    const { user } = this.state
    const resultsRef = (userId) => firebase.database().ref(`results/${userId}`)
    const snapshot = await resultsRef(user.id).once('value')
    const existingResults = snapshot.val()
    if (existingResults) return // display "you results have already been collected and won't be saved again"
    resultsRef(user.id).set(results);
  }

  /**
   * @param input.name user name to save to the database
   */
  getUser = async (name) => {
    // save user
    // get id and name back
    // save id and name to state
    let user = await this.fetchUser({ name })
    console.log('user - ', user)
    if (!user) return this.saveUser(name)
    this.saveUserToState(user)
  }

  saveUser = (name) => {
    const newUser = usersRef.push()
    newUser.set({ name }, (error) => {
      if (error) console.log('error - ', error)
      else {
        const userId = newUser.getKey()
        const user = { name, id: userId }
        this.saveUserToState(user)
      }
    })
  }

  fetchUser = async (input) => {
    const snapshot = await usersRef.once('value')
    const users = snapshot.val()
    if (!users) return
    const fetchedUser = Object.entries(users).find(([id, user]) => user.name === input.name)
    // not very readable if we access some random element by index
    // either add validation that the value is value
    // or somehow convert array to a different form / data type
    const user = fetchedUser ? { id: fetchedUser[0], name: fetchedUser[1].name } : undefined
    return user
  }

  saveUserToState = (user) => this.updateState('user', user)

  updateState = (spacePath, value, callback) => {
    const newState = u.updateIn(spacePath, value, this.state)
    this.setState(newState, callback)
  }

  render() {
    return null
    /*  return (
       <PromptDialog getUser={this.getUser} saveResults={this.saveResults} user={this.state.user} />
     ); */
  }
}

export default App;