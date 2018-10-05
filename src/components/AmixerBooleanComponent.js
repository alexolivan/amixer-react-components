import React, { Component } from 'react';
import axios from 'axios';
import qs from 'qs';

import Switch from 'rc-switch';
import 'rc-switch/assets/index.css';

export default class AmixerEnumeratedComponent extends Component {

  constructor(props) {
    super(props);

    this.state = {
      uri: this.props.amixerAPI + "/" + this.props.control.info.numid,
      values: this.props.control.current_values,
      linked: false,
      isLoading: true
    }
  }

  componentDidMount() {
    axios.get(this.state.uri)
      .then (response => {
        this.setState({
          values: response.data.current_values,
          linked: Object.values(response.data.current_values).every(value => value === response.data.current_values[0]),
          isLoading: false
        });
      })
      .catch (error => {
        this.setState({
          error: error,
          isLoading: false
        });
      });
  }

  onSwitchChange = (key, value) => {
    let valueStr = value ? "on" : "off";
    let values = {...this.state.values};
    if (this.state.linked){
      Object.keys(values).map(key => {
        return values[key] = valueStr;
      });
    }else{
      values[key] = valueStr;
    }

    const valuesStr = Object.keys(values).map(key => values[key]).join(',');

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

    this.setState({values});
  }

  onLinkedSwitchChange = (value) => {
    this.setState({linked: value});
  }

  render() {
    return (
      <div className="AmixerIntegerComponent d-flex p-2 m-2 flex-column border border-secondary">
        <div className="d-flex justify-content-center mt-2">
          <span>{this.props.label ? this.props.label : ''}</span>
        </div>
        <div className="d-flex flex-row justify-content-center">

          {Object.keys(this.props.control.current_values).map((key) =>
            <Switch
              key={key}
              className="switch m-2"
              checked={this.state.values[key] === "on" ? true : false}
              disabled={!this.props.control.info.access.includes('w')}
              checkedChildren={'ON'}
              unCheckedChildren={'OFF'}
              onChange={this.onSwitchChange.bind(this, key)}
            />
          )}

        </div>

        {this.props.control.info.access.includes('w') && (
          <div className="d-flex justify-content-center mt-2">
            <Switch
              className="switch"
              checked={this.state.linked}
              disabled={!this.props.control.info.access.includes('w')}
              checkedChildren={'ON'}
              unCheckedChildren={'OFF'}
              onChange={this.onLinkedSwitchChange}
            />
          </div>
        )}
        {this.props.control.info.access.includes('w') && (
          <div className="d-flex justify-content-center mb-2">
            <span>Linked</span>
          </div>
        )}

        <div className="d-flex justify-content-center text-center p-1 mt-3">
          <span>{this.props.showALSAName ? this.props.control.info.name : ''}</span>
        </div>
      </div>
    );
  }
}
