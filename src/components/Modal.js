import React from "react";

export default class Modal extends React.Component {
    constructor() {
        super()

        this.state = {
            due: "",
            subTasks: [],
            input: ""
        }
    }

    componentDidUpdate = () => {
        if (this.state.due === "") {
            this.setState({ due: this.props.data.task.due, subTasks: this.props.data.task.subTasks })
        }
    }

    onChange = (event) => {
        this.setState({ due: event.target.value })
    }

    onChangeInput = (event) => {
        this.setState({ input: event.target.value })
    }

    onKeyDown = (event) => {
        if (event.code === "Enter") {
            let subTasks = [...this.state.subTasks]
            subTasks.push({ task: this.state.input, isFinished: false })

            this.setState({ subTasks, input: "" })
        }
    }

    submit = () => {
        this.props.submit({ ...this.state }, this.props.data.topicId, this.props.data.task)
        this.props.close()
    }

    delete = ()=> {
        this.props.delete(this.props.data.topicId, this.props.data.task)
        this.props.close()
    }

    render() {
        return (
            <div className="modal" onClick={this.props.close}>

                <div className="modal-inner" onClick={e => e.stopPropagation()}>

                    <h2>{this.props.data.task.task}</h2>

                    <div className="body">
                        <div className="row">
                            <p>Due Date:</p>
                            <input type="date"
                                value={this.state.due}
                                onChange={this.onChange}
                            />
                        </div>

                        <p>Task Breakdown</p>

                        {/* Tasks */}
                        {this.state.subTasks.map((task, index) => (
                            <div className='task' key={"task-" + index}>
                                <input type="checkbox" checked={task.isFinished} className='checkbox' />
                                <p className={task.isFinished ? "strike" : ""}>{task.task}</p>
                            </div>
                        ))}

                        <div className="row">
                            <input type="checkbox" className='checkbox' disabled />
                            <input className='input' placeholder='Write a task...'
                                value={this.state.input}
                                onChange={this.onChangeInput}
                                onKeyDown={this.onKeyDown}
                            />
                        </div>
                    </div>

                    <div className="footer">
                        <button onClick={this.delete}>
                            Delete
                        </button>
                        <button onClick={this.submit}>
                            Save
                        </button>
                    </div>

                </div>

            </div>
        )
    }
}