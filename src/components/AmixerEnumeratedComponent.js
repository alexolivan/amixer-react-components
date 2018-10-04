import React, { Component } from 'react';
import axios from 'axios';
import qs from 'qs';


export default class AmixerEnumeratedComponent extends Component {

  constructor(props) {
    super(props);

    this.state = {
      uri: this.props.amixerAPI + "/" + this.props.control.info.numid,
      value: this.props.control.current_values[0],

      isLoading: true
    }
  }

  componentDidMount() {
    axios.get(this.state.uri)
      .then (response => {
        this.setState({
          value: response.data.current_values[0],
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

  handleClick = () => {
    let value = Number(this.state.value)
    value + 1 >= Number(this.props.control.info.items) ? value = 0 : value++;

    axios({
      method: 'post',
      url: this.state.uri,
      data: qs.stringify({
        values: value,
      }),
      headers: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      }
    }).then(response => {
      this.setState({
        value
      });
      this.computeValues();
    }).catch(error => {
      this.setState({
        error: error
      });
    })
  }

  render() {
    return (
      <div className="AmixerIntegerComponent d-flex p-2 m-2 flex-column border border-secondary">
        <div className="d-flex justify-content-center mt-2">
          <span>{this.props.label ? this.props.label : ''}</span>
        </div>
        <div className="d-flex text-center p-1 mt-3">
          <button
            className="btn btn-outline-info btn-sm"
            disabled={!this.props.control.info.access.includes('w')}
            onClick={this.handleClick}
            type="button">
            <span>{this.props.control.item_value_map[this.state.value]}</span>
          </button>
        </div>
        <div className="d-flex justify-content-center text-center p-1 mt-3">
          <span>{this.props.showALSAName ? this.props.control.info.name : ''}</span>
        </div>
      </div>
    );
  }

}
