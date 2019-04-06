import React from 'react';
import * as MUI from '@material-ui/core'
import _ from 'lodash';

import { DISPLAY_RESULTS } from './CONSTANTS';
import { humanCase } from './utilities';

const { BY_DIALOG, BY_TYPE } = DISPLAY_RESULTS


const Radios = (props) => {
  return (
    <MUI.RadioGroup onChange={props.onSelect} style={{ display: 'flex', flexDirection: 'row' }} value={props.selectedValue}>
      <MUI.FormControlLabel control={<MUI.Radio />} label={humanCase(BY_DIALOG)} value={BY_DIALOG} />
      <MUI.FormControlLabel control={<MUI.Radio />} label={humanCase(BY_TYPE)} value={BY_TYPE} />
    </MUI.RadioGroup>
  );
}

export default Radios;
