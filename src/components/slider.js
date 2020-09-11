import React from "react";
// import ReactDOM from 'react-dom';

class Slider extends React.Component {
    constructor(props) {
        super(props);
        this.state = { time: 0 };
      }
    myChangeHandler = (event) => {
        this.setState({time: event.target.value});
        //console.log(event.target.value)
      }


    render(){
        const timeCodes = {
            0: "50 Minutes Ago",
            1: "45 Minutes Ago",
            2: "40 Minutes Ago",
            3: "35 Minutes Ago",
            4: "30 Minutes Ago",
            5: "25 Minutes Ago",
            6: "20 Minutes Ago",
            7: "15 Minutes Ago",
            8: "10 Minutes Ago",
            9: "5 Minutes Ago",
            10: "Current"
        }
        let timeDesc = timeCodes[this.state.time];
        let time = this.state.time;
        return (<div className="my-5">
            <h2>Weather Radar Overlay</h2>
        <label htmlFor="customRange1">Time: {timeDesc}</label>
        <input type="range" min="0" max="10" value = {time} className="custom-range" id="customRange1" onChange={this.myChangeHandler}/>
        
        </div>)
        }
}

export default Slider;