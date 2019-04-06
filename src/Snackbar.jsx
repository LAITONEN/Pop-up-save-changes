
import React from 'react';
import * as MUI from '@material-ui/core';
import u from 'updeep'

const SnackbarMessage = (message) => {
  /* const firstLine = React.isValidElement(message.firstLine) ? message.firstLine : <span>{message.firstLine}</span> */
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span><React.Fragment>{message.firstLine}</React.Fragment></span>
      <span>{message.secondLine}</span>
    </div>
  )
}

// add timer?
class Snackbar extends React.Component {

  state = {
    autoHideDuration: {
      left: this.props.autoHideIn,
      initialValue: this.props.autoHideIn,
      interval: 1000,
    }
  }

  componentDidMount() {
    if (this.props.showTimer) {
      this.timerId = setInterval(this.updateTimer, this.state.autoHideDuration.interval)
    }
  }

  componentWillUnmount() {
    clearInterval(this.timerId)
  }

  updateTimer = () => {
    const { autoHideDuration } = this.state
    const possibleValue = autoHideDuration.left - autoHideDuration.interval
    const newValue = possibleValue < 0 ? 0 : possibleValue
    const newState = u.updateIn('autoHideDuration.left', newValue, this.state)
    this.setState(newState)
  }

  renderTimer = () => {
    const timerLabel = Math.ceil(this.state.autoHideDuration.left / 1000)
    return (
      <MUI.Avatar style={{
        backgroundColor:
          '#f50057'
      }} >{String(timerLabel)}</MUI.Avatar>
    )
  }

  render() {
    const timer = this.props.showTimer ? this.renderTimer() : null
    return (
      <MUI.Snackbar
        anchorOrigin={{ vertical: 'center', horizontal: 'center' }}
        autoHideDuration={this.props.autoHideIn}
        disableWindowBlurListener={true}
        onClose={this.props.closeSnackbar}
        open={this.props.open}
        message={SnackbarMessage(this.props.message)}
        action={[
          timer,
          <MUI.Button color='secondary' key={1} size="small" onClick={this.props.closeSnackbar}>
            {this.props.buttonText}
          </MUI.Button>,
        ]}
      />
    )
  }
}

export default Snackbar