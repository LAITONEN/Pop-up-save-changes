import React from 'react';

import Button from '@material-ui/core/Button';
import * as MUI from '@material-ui/core';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import { withStyles } from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';

import u from 'updeep'
import _ from 'lodash'
import { diff } from 'deep-object-diff'

import Snackbar from './Snackbar'
import Results from './Results';
import { DISPLAY_RESULTS, ELEMENTS } from './CONSTANTS'
import { cloneDeep, spacePathExists, shuffleArray, removeElementAt } from './utilities';

// IMPORTANT!
// 1. Where do I start the timer for the first time?
// 2. props.open should not override dialog.open when the latter one changes.
// 3. I don't like that parent component controls the dialog visibility of this component
// 4. Divide into different components

// 1. DONE User clicks button:
//    a. set up timer
//    b. prompt dialog
// 2. User responds to dialog:
//    a. open snackbar
//    b. display response type (save / destroy etc) and time that was required to do so
// 3. Save responses to firebase
// 4. Create another page to display the results

const { DIALOG, SNACKBAR } = ELEMENTS

const styles = {
  avatar: {
    backgroundColor: blue[100],
    color: blue[600],
  },
};

const FlexibleButton = (props) => {
  return (
    <MUI.Button color="primary" onClick={props.handler}>{props.text}</MUI.Button>
  )
}

const tutorialElements = [
  {
    content: {
      primaryText: 'Some text will appear here.',
      secondaryText: 'Some text will appear here. You will need to choose to click "yes" or "no" buttons based on those texts in order to keep the imaginary changes that you\'ve made. Press any button to see the possible text.',
    },
    elementKey: DIALOG,
    handlerName: { cancel: 'resetExperiment', yes: 'showNextTutorialElement', no: 'showNextTutorialElement' },
    saveButton: undefined,
    type: undefined,
  },
  {
    content: {
      primaryText: 'TEST: Your form has changes pending to be saved.',
      secondaryText: 'If you want to save them - press "yes".',
    },
    elementKey: DIALOG,
    handlerName: { cancel: 'resetExperiment', yes: 'showCongratulationsSnackbar', no: 'showUnfortunatelySnackbar' },
    saveButton: undefined,
    type: undefined,
  },
  {
    content: {
      primaryText: 'Congratulations, you got it right!',
      secondaryText: 'Now let\'s go to the actual experiment.',
    },
    elementKey: SNACKBAR,
    handlerName: { next: 'endTutorial' },
    saveButton: undefined,
    snackbar: {
      buttonText: 'Finish'
    },
    type: undefined,
  },
  {
    content: {
      primaryText: 'Unfortunately you\'ve clicked the wrong button.',
      secondaryText: '',
    },
    elementKey: SNACKBAR,
    handlerName: { next: 'goBackToTestDialog' },
    saveButton: undefined,
    snackbar: {
      buttonText: 'Try Again'
    },
    type: undefined,
  },
]

const allDialogs = [
  {
    content: {
      primaryText: 'You made changes to the form.',
      secondaryText: 'Do you want to ditch them?',
    },
    handlerName: { cancel: 'handleCancel', yes: 'handleDestroy', no: 'handleSave' },
    saveButton: 'no',
    type: 'statementQuestion',
  },
  {
    content: {
      primaryText: 'Do you want to save your changes?',
      secondaryText: 'Your changes will be lost if you don\'t save them.',
    },
    handlerName: { cancel: 'handleCancel', yes: 'handleSave', no: 'handleDestroy' },
    saveButton: 'yes',
    type: 'questionElaboration',
  },
  {
    content: {
      primaryText: 'Your form contains changes.',
      secondaryText: 'Do you want to save them?',
    },
    handlerName: { cancel: 'handleCancel', yes: 'handleSave', no: 'handleDestroy' },
    saveButton: 'yes',
    type: 'statementQuestion',
  },
  {
    content: {
      primaryText: 'Do you want to ditch your changes?',
      secondaryText: 'Your changes will be lost if you ditch them.',
    },
    handlerName: { cancel: 'handleCancel', yes: 'handleDestroy', no: 'handleSave' },
    saveButton: 'no',
    type: 'questionElaboration',
  },
  {
    content: {
      primaryText: 'Do you want to keep your changes?',
      secondaryText: 'Your changes will be lost if you don\'t save them.',
    },
    handlerName: { cancel: 'handleCancel', yes: 'handleSave', no: 'handleDestroy' },
    saveButton: 'yes',
    type: 'questionElaboration',
  },
  {
    content: {
      primaryText: 'Your form contains changes.',
      secondaryText: 'Do you want to destroy them?',
    },
    handlerName: { cancel: 'handleCancel', yes: 'handleDestroy', no: 'handleSave' },
    saveButton: 'no',
    type: 'statementQuestion',
  },
  {
    content: {
      primaryText: 'You have unsaved changes in your form.',
      secondaryText: 'Do you want to keep them?',
    },
    handlerName: { cancel: 'handleCancel', yes: 'handleSave', no: 'handleDestroy' },
    saveButton: 'yes',
    type: 'statementQuestion',
  },
  {
    content: {
      primaryText: 'Do you want to destroy unsaved changes?',
      secondaryText: 'If you don\'t save the changes, they will be lost.',
    },
    handlerName: { cancel: 'handleCancel', yes: 'handleDestroy', no: 'handleSave' },
    saveButton: 'no',
    type: 'questionElaboration',
  },
  {
    content: {
      primaryText: 'Save changes?',
      secondaryText: 'If you don\'t save the changes, they will be lost.',
    },
    handlerName: { cancel: 'handleCancel', yes: 'handleSave', no: 'handleDestroy' },
    saveButton: 'no',
    type: 'questionElaboration',
  },
  {
    content: {
      primaryText: 'You have unsaved changes.',
      secondaryText: 'Do you want to save them?',
    },
    handlerName: { cancel: 'handleCancel', yes: 'handleSave', no: 'handleDestroy' },
    saveButton: 'no',
    type: 'statementQuestion',
  }
]

const initialState = {
  dialog: {
    all: allDialogs, // readonly
    current: null, // readonly
    remaining: [], // mutation
    timeElapsed: 0,
  },
  elements: {
    visible: {
      buttons: true,
      dialog: false,
      snackbar: false,
    }
  },
  userNameInput: {
    value: '',
  },
  results: {
    show: false,
  },
  tutorial: {
    complete: false,
    ongoing: false,
    element: {
      data: tutorialElements[0],
      ordinal: 0,
    },
  },
  user: {
    responses: {
      all: [], // { dialogId: undefined, saved: undefined, time: undefined, type: undefined }
      current: {}
    }
  }
}


class PromptDialog extends React.Component {

  state = initialState

  componentDidMount = () => {
    window._d = {
      state: this.state,
      updateState: this.updateState
    }
    this.resetExperiment()
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    if (this.isTimerUpdate(nextState)) return false
    return true
  }

  /**
  * Function for shouldComponentUpdate to check if the update was triggered by the property of the state, where the timer value is stored.
  */
  isTimerUpdate = (nextState) => {
    const change = diff(this.state, nextState)
    if (spacePathExists(change, 'dialog.timeElapsed')) return true
    return false
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.dialog.remaining.length !== this.state.dialog.remaining.length) {
      const newState = cloneDeep(this.state)
      newState.dialog.current = newState.dialog.remaining[0]
      this.setState(newState)
    }
    window._d.state = this.state
  }

  componentWillUnmount() {
    if (this.timerId) this.clearInterval()
  }

  /* componentDidUpdate() {
    // the first time component gets rendered
    // this function looks ugly
    if (this.state.dialog.open !== this.props.open) {
      const newState = cloneDeep(this.state)
      if (this.props.open) newState = this.handleOpenNextDialog(newState)
      else {
        // not the greatest idea to update this particular property here
        newState.dialog.current = null
        // this line is already being handled inside this.handleOpenNextDialog above
        // newState.dialog.open = this.props.open
      }
      this.setState(newState)
    }
  } */


  handleSave = () => this.saveUserResponse({ userPerformedSave: true })

  handleDestroy = () => this.saveUserResponse({ userPerformedSave: false })

  handleCancel = () => {
    this.resetExperiment()
    this.clearInterval()
  }

  saveUserResponse = ({ userPerformedSave }) => {
    this.updateState('elements.visible.dialog', false, () => {
      const newState = cloneDeep(this.state)
      this.clearInterval()
      newState.elements.visible.snackbar = true
      newState.dialog.remaining.shift() // transition
      newState.dialog.timeElapsed = 0
      // two similar assignments
      newState.user.responses.current = {
        content: this.state.dialog.current.content,
        saved: userPerformedSave,
        time: this.state.dialog.timeElapsed,
        type: this.state.dialog.current.type,
      }
      // too long line
      newState.user.responses.all = newState.user.responses.all.concat(newState.user.responses.current)
      this.setState(newState)
    })
  }

  resetState = () => {
    // set state to default value
    // maybe only those props of a state that are passed as an array of state space paths to here
  }

  changeElementVisibility = (elementName, visible) => this.updateState(elementName, visible)

  updateState = (spacePath, value, callback) => {
    const newState = u.updateIn(spacePath, value, this.state)
    this.setState(newState, callback)
  }

  clearInterval = (id = this.timerId) => clearInterval(id)

  setInterval = (time = 10) => {
    this.timerId = setInterval(this.updateTime, time)
  }

  updateTime = (time = 10) => {
    const newTime = this.state.dialog.timeElapsed + time
    console.log(newTime)
    this.updateState('dialog.timeElapsed', newTime)
  }

  // the function not always closes the snackbar, but also switched to next dialog in most of the cases
  // think about naming
  closeSnackbar = () => {
    let newState = cloneDeep(this.state)
    newState.elements.visible.snackbar = false
    newState.dialog.timeElapsed = 0
    newState.user.responses.current = {}
    if (newState.dialog.remaining.length === 0) this.handleResults(newState)
    else this.openNextDialog(newState)
  }

  handleResults = (futureState) => {
    this.showResults(futureState)
    console.log('this.state.user.responses.all - ', this.state.user.responses.all)
    this.props.saveResults(this.state.user.responses.all)
  }

  showResults = (futureState) => {
    const newState = cloneDeep(futureState)
    newState.results.show = true
    this.setState(newState)
  }

  openNextDialog = (futureState) => {
    const newState = cloneDeep(futureState)
    newState.elements.visible.dialog = true
    newState.dialog.current = cloneDeep(newState.dialog.remaining[0])
    this.setState(newState, this.setInterval)
  }


  resetExperiment = (modifiedInitialState = initialState) => {
    const newState = cloneDeep(modifiedInitialState)
    const finalDialogs = this.randomizeDialogs(modifiedInitialState)
    newState.dialog.remaining = cloneDeep(finalDialogs)
    newState.dialog.current = cloneDeep(newState.dialog.remaining[0])
    this.setState(newState)
  }

  randomizeDialogs = (futureState) => {
    const newState = cloneDeep(futureState)
    const shuffledDialogs = shuffleArray(newState.dialog.all)
    const randomIndex = Math.floor(Math.random() * shuffledDialogs.length)
    return removeElementAt(shuffledDialogs, randomIndex)
  }

  saveUserName = () => this.props.getUser(this.state.userNameInput.value.trim())

  startExperiment = () => {
    const newState = cloneDeep(this.state)
    newState.tutorial.complete = true
    newState.elements.visible = this.getUpdatedElementsVisibility([DIALOG], true)
    setTimeout(() => this.setState(newState, this.setInterval(10)), 500)
  }

  startTutorial = () => {
    const newState = cloneDeep(this.state)
    newState.tutorial.ongoing = true
    newState.elements.visible.dialog = true
    this.setState(newState)
  }

  showNextTutorialElement = () => {
    const newOrdinal = this.state.tutorial.element.ordinal + 1
    this.openTutorialElement(newOrdinal)
  }

  showCongratulationsSnackbar = () => this.openTutorialElement(2)

  showUnfortunatelySnackbar = () => this.openTutorialElement(3)

  goBackToTestDialog = () => this.openTutorialElement(1)

  /**
   * @param ordinal index of element in const tutorialElements
   * @param elementName check ELEMENTS in CONSTANTS.js
   */
  openTutorialElement = (ordinal) => {
    const nextElement = {
      data: tutorialElements[ordinal],
      ordinal
    }
    const { elementKey } = nextElement.data
    const newState = cloneDeep(this.state)
    newState.tutorial.element = nextElement
    newState.elements.visible = this.getUpdatedElementsVisibility([elementKey], true)
    this.setState(newState)
  }

  /**
   * @param value boolean to set visibility of "elements" to, other elements will be of the opposite visibility
   */
  getUpdatedElementsVisibility = (elements, value) => {
    return Object.values(ELEMENTS).reduce((res, elementKey) => {
      res[elementKey] = elements.includes(elementKey)
      return res
    }, {})
  }

  endTutorial = () => {
    console.log('endTutorial')
    const futureState = cloneDeep(initialState)
    futureState.tutorial.complete = true
    futureState.tutorial.ongoing = false
    futureState.tutorial.element = {}
    this.resetExperiment(futureState)
  }

  renderUserNameInput = () => {
    return (
      <MUI.TextField
        autoFocus
        id="username"
        label="User Name"
        value={this.state.userNameInput.value}
        onChange={(e) => this.updateState('userNameInput.value', e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' ? this.saveUserName() : false}
        margin="normal"
      />
    )
  }

  renderUserNameElements = () => {
    const userSaved = Boolean(this.props.user.id)
    const inputValue = this.state.userNameInput.value
    let userNameInput = userSaved ? null : this.renderUserNameInput()
    let userNameButton = !userSaved && inputValue ? <MUI.Button color='secondary' key={1} onClick={this.saveUserName}>Save</MUI.Button> : null
    return (
      <div>
        {userNameInput}
        {userNameButton}
      </div>
    )
  }

  renderUserNameText = () => <span style={{ position: 'absolute', bottom: 7, left: 7 }}>{this.props.user.name}</span>

  renderButtons = () => {
    const { tutorial } = this.state
    const userSaved = Boolean(this.props.user.id)
    let startExperiment = <MUI.Button color='primary' disabled={!userSaved} key={0} onClick={this.startExperiment}>Start Experiment</MUI.Button>
    let startTutorial = tutorial.complete || tutorial.ongoing ? null : <MUI.Button color='primary' key={1} onClick={this.startTutorial}>Tutorial</MUI.Button>
    return (
      <div>
        {startExperiment}
        {startTutorial}
      </div>
    )
  }

  renderDialog = () => {
    // 1. how do I set this dialog to state?
    //    and should I even bother or is it fine to not have a separate value for currentDialog aka dialog.all[0]?
    // 2. what if dialog.all is empty?
    const dialogData = this.state.tutorial.complete ? this.state.dialog.current : this.state.tutorial.element.data
    const yesHandler = dialogData.handlerName.yes ? this[dialogData.handlerName.yes] : () => { }
    const noHandler = dialogData.handlerName.no ? this[dialogData.handlerName.no] : () => { }
    const cancelHandler = dialogData.handlerName.cancel ? this[dialogData.handlerName.cancel] : () => { }
    return (
      <MUI.Dialog
        onClose={cancelHandler}
        open={this.state.elements.visible.dialog}
        style={{ margin: 'auto', maxWidth: '30%' }}
      >
        <MUI.DialogTitle>
          {dialogData.content.primaryText}
        </MUI.DialogTitle>
        <MUI.DialogContent>
          <MUI.DialogContentText>
            {dialogData.content.secondaryText}
          </MUI.DialogContentText>
        </MUI.DialogContent>
        <MUI.DialogActions>
          <FlexibleButton handler={yesHandler} text="Yes" />
          <FlexibleButton handler={noHandler} text="No" />
          <FlexibleButton handler={() => cancelHandler()} text="Cancel" />
        </MUI.DialogActions>
      </MUI.Dialog>
    )
  }

  renderResults = () => {
    const { user } = this.state
    return (
      <Results
        results={{ data: user.responses.all }}
      />
    )
  }

  renderSnackbar = () => {
    const { dialog, elements, tutorial, user } = this.state
    const userResponse = user.responses.current
    let buttonText = dialog.remaining.length > 0 ? 'Next' : 'Display the results'
    if (tutorial.ongoing) buttonText = tutorial.element.data.snackbar.buttonText || "Next"
    const handler = tutorial.ongoing ? this[tutorial.element.data.handlerName.next] : this.closeSnackbar
    const message = this.getSnackbarMessage()
    return (
      <Snackbar
        autoHideIn={3000}
        buttonText={buttonText}
        closeSnackbar={handler}
        open={elements.visible.snackbar}
        showTimer={dialog.remaining.length > 0}
        message={message}
      />
    )
  }

  getSnackbarMessage = () => {
    const { tutorial, user } = this.state
    if (tutorial.ongoing)
      return {
        firstLine: tutorial.element.data.content.primaryText,
        secondLine: tutorial.element.data.content.secondaryText,
      }
    else {
      return {
        firstLine: <React.Fragment>You <strong>{user.responses.current.saved ? 'SAVED' : 'DESTROYED'}</strong> the changes.</React.Fragment>,
        secondLine: `It took you ${user.responses.current.time} milliseconds.`,
      }
    }
  }

  render() {
    console.log('this.state - ', this.state)
    let dialog = this.state.elements.visible.dialog ? this.renderDialog() : null
    let snackbar = this.state.elements.visible.snackbar ? this.renderSnackbar() : null
    let results = this.state.results.show ? this.renderResults() : null
    let buttons = this.state.elements.visible.buttons && this.props.user.name ? this.renderButtons() : null
    let userNameForm = this.props.user.id ? null : this.renderUserNameElements()
    let userNameText = this.props.user.name ? this.renderUserNameText() : null

    return (
      <div style={{ display: 'flex', alignItems: 'center', height: '100vh', justifyContent: 'center' }}>
        {userNameForm}
        {buttons}
        {dialog}
        {snackbar}
        {results}
        {userNameText}
      </div>
    );
  }
}

export default withStyles(styles)(PromptDialog);