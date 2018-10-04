import React, { Component } from 'react';
import axios from 'axios';
import qs from 'qs';
import { throttle } from 'throttle-debounce';

import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import Switch from 'rc-switch';
import 'rc-switch/assets/index.css';



export default class AmixerIntegerComponent extends Component {

  constructor(props) {
    super(props);

    this.state = {
      uri: this.props.amixerAPI + "/" + this.props.control.info.numid,
      values: this.props.control.current_values,
      linked: true,
      isLoading: true
    }
  }

  computeValues = () => {
    if (this.props.step){
      let computedValues = Object.keys(this.state.values).map(key => {
        return (this.props.basemin + this.state.values[key] * this.props.step).toFixed(2).toString() + this.props.unit;
      });
      this.setState({computedValues});
    }
  }

  componentDidMount() {
    axios.get(this.state.uri)
      .then (response => {
        this.setState({
          values: response.data.current_values,
          isLoading: false
        });
        this.computeValues();
      })
      .catch (error => {
        this.setState({
          error: error,
          isLoading: false
        });
      });
  }


  onSliderChange = throttle(100, (value) => {
    let values = {...this.state.values};
    Object.keys(values).map(key => {
      return values[key] = value
    });
    this.setState({values});
    this.computeValues();
  })

  onSliderAfterChange = () => {
    const valuesStr = Object.keys(this.state.values).map(key => this.state.values[key]).join(',');

    axios({
      method: 'post',
      url: this.state.uri,
      data: qs.stringify({
        values: valuesStr,
      }),
      headers: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      }
    }).then(response => {
      this.setState({
        values: response.data.current_values
      });
      this.computeValues();
    }).catch(error => {
      this.setState({
        error: error
      });
    })
  }

  onSwitchChange = (value) => {
    this.setState({linked: value});
    //TODO Handle non-linked sliders (need to get key from child component)
  }

  render() {
    return (
      <div className="AmixerIntegerComponent d-flex p-2 m-2 flex-column border border-secondary">
        <div className="d-flex justify-content-center mt-2">
          <span>{this.props.label ? this.props.label : ''}</span>
        </div>
        <div className="d-flex flex-row justify-content-center">

          {Object.keys(this.props.control.current_values).map((key) =>
            <div key={key} className="d-flex flex-column">
              <div className="d-flex mt-2 justify-content-center">
                <span>{this.props.control.info.values === '2' ? key === '0' ? 'R' : 'L' : key }</span>
              </div>
              <div className="d-flex justify-content-center mt-4">
                <Slider
                  className="slider"
                  vertical={true}
                  min={Number(this.props.control.info.min)}
                  max={Number(this.props.control.info.max)}
                  disabled={!this.props.control.info.access.includes('w')}
                  onChange={this.onSliderChange}
                  onAfterChange={this.onSliderAfterChange}
                  value={Number(this.state.values[key])}
                />
              </div>
              <div className="d-flex mt-3 justify-content-center">
                <span>{this.state.computedValues ? this.state.computedValues[key] : this.state.values[key] }</span>
              </div>
            </div>
          )}

        </div>
        <div className="d-flex justify-content-center mt-2">
          <Switch
            className="switch"
            checked={this.state.linked}
            disabled={!this.props.control.info.access.includes('w')}
            checkedChildren={'ON'}
            unCheckedChildren={'OFF'}
            onChange={this.onSwitchChange}
          />
        </div>
        <div className="d-flex justify-content-center mb-2">
          <span>Linked</span>
        </div>
        <div className="d-flex justify-content-center text-center p-1 mt-3">
          <span>{this.props.showALSAName ? this.props.control.info.name : ''}</span>
        </div>
      </div>
    );
  }
}
