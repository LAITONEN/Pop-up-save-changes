import React from 'react';
import Radios from './Radios'
import Table from './Table'

import { DISPLAY_RESULTS } from './CONSTANTS';

class Results extends React.Component {

  state = {
    selectedValue: DISPLAY_RESULTS.BY_DIALOG
  }

  changeResultsDisplay = (e) => {
    this.setState({ selectedValue: e.target.value })
  }

  render() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Radios onSelect={this.changeResultsDisplay} selectedValue={this.state.selectedValue} />
        <Table results={this.props.results} selectedValue={this.state.selectedValue} />
      </div>
    );
  }
}

export default Results;
