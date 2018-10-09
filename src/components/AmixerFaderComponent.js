import React, { Component } from 'react';
import Snap from 'snapsvg-cjs';



export default class AmixerFaderComponent extends Component {

  constructor(props) {
    super(props)
    this.state = {
      value: props.value
    }
  }

  componentDidMount() {
    Object.keys(this.props.control.current_values).map((key) => {
      this['s' + key] = Snap('#svg' + this.props.someId + key);
      this['rect1' + key] = this['s' + key].rect(0,0,12,100);
      this['rect2' + key] = this['s' + key].rect(0,0,12,0);

      this['rect1' + key].attr('fill', 'L(12, 100, 0, 0)#0f0:30-#ff0:60-#f00');
      this['rect1' + key].attr({stroke: "#000",strokeWidth: 1});
      this['rect2' + key].attr({fill: "#000"});
      return null;
    });
  }

  componentWillReceiveProps(nextProps) {
    Object.keys(this.props.control.current_values).map((key) => {
      this['rect2' + key].attr({height:100 - nextProps.values[key]});
      return null;
    });
  }

  render() {
    return (
      <div className="AmixerFaderComponent d-flex p-2 m-2 flex-column border border-secondary">
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
                <svg className="fader" id={'svg' + this.props.someId + key}></svg>
              </div>
            </div>
          )}

        </div>
        <div className="d-flex justify-content-center text-center p-1 mt-3">
          <span>{this.props.showALSAName ? this.props.control.info.name : ''}</span>
        </div>
      </div>
    );
  }
}
