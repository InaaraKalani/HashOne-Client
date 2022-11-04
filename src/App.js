import './assets/style.css';
import React from 'react';
import moment from "moment"
import axios from 'axios';
import Modal from './components/Modal';

export default class App extends React.Component {

  constructor() {
    super()

    this.state = {
      list: [],
      modalData: {}
    }
  }

  componentDidMount = async () => {
    const result = (await axios.get('http://localhost:3001/topic/getAll')).data

    let list = await Promise.all(result.map(e => ({ ...e._doc, tasks: e.tasks, input: "" })))
    list[0].isExpanded = true

    this.setState({ list })
  }

  toggleExpand = (index) => {
    let list = [...this.state.list]
    list[index].isExpanded = !list[index].isExpanded
    this.setState({ list })
  }

  onChange = (event, index) => {
    let list = [...this.state.list]
    list[index].input = event.target.value
    this.setState({ list })
  }

  submit = async (event, topicId) => {
    if (event.code === "Enter") {

      let result = await axios.post('http://localhost:3001/task/add', {
        topicId,
        task: this.state.list.find(e => e._id === topicId).input
      })

      let list = [...this.state.list]
      let index = list.findIndex(e => e._id === topicId)
      list[index].tasks.push(result.data)
      list[index].input = ""

      this.setState({ list })
    }
  }

  toggleCheck = async (event, taskId, index) => {
    await axios.post('http://localhost:3001/task/update/' + taskId, {
      isFinished: event.target.checked
    })

    let list = [...this.state.list]
    let taskIndex = list[index].tasks.findIndex(e => e._id === taskId)
    list[index].tasks[taskIndex].isFinished = !event.target.checked

    this.setState({ list })
  }

  closeModal = () => {
    this.setState({
      showModal: false
    })
  }

  editTask = (topicId, task) => {
    this.setState({
      modalData: { topicId, task }, showModal: true
    })
  }

  updateTask = async (data, topicId, task) => {
    await axios.post('http://localhost:3001/task/update/' + task._id, data)

    let list = [...this.state.list]

    let topicIndex = list.findIndex(e => e._id === topicId)
    let taskIndex = list[topicIndex].tasks.findIndex(e => e._id === task._id)

    list[topicIndex].tasks[taskIndex] = { ...task, ...data }

    this.setState({ list })
  }

  deleteTask = async (topicId, task) => {
    await axios.post('http://localhost:3001/task/delete/' + task._id)
    let list = [...this.state.list]
    let topicIndex = list.findIndex(e => e._id === topicId)
    list[topicIndex].tasks.filter(e => e._id !== task._id)
    this.setState({ list })
  }

  toggleCheckSubTask = async (event, task, topicId, subIndex) => {

    let list = [...this.state.list]
    let topicIndex = list.findIndex(e => e._id === topicId)
    let taskIndex = list[topicIndex].tasks.findIndex(e => e._id === task._id)
    list[topicIndex].tasks[taskIndex].subTasks[subIndex].isFinished = event.target.checked
    this.setState({ list })

    await axios.post('http://localhost:3001/task/update/' + task._id, { subTasks: list[topicIndex].tasks[taskIndex].subTasks })
  }

  render() {
    return (
      <>
        {this.state.showModal && <Modal data={this.state.modalData} close={this.closeModal} submit={this.updateTask} delete={this.deleteTask} />}

        <div className='container'>
          <div className='border-design' />

          {this.state.list.map((e, i) => (
            <div className='task' key={"topic" + e._id}>

              {/* Task Heading */}
              <div className='Heading'>
                <span className="material-icons-round">
                  folder
                </span>
                <h3>{e.TopicName}</h3>
                <hr />
                <button className="clean-btn material-icons" onClick={() => this.toggleExpand(i)}>
                  keyboard_arrow_down
                </button>
                {!e.isExpanded && (
                  <div className='length'>
                    <p>{e.tasks?.length}</p>
                  </div>
                )}
              </div>

              {e.isExpanded && (
                <div>

                  {/* Tasks */}
                  {e.tasks.map((task, index) => (
                    <div key={"task-" + e._id + index}>
                      <div className='task'>
                        <input type="checkbox" checked={task.isFinished} className='checkbox' onChange={event => this.toggleCheck(event, task._id, i)} />
                        <p className={task.isFinished ? "strike" : ""}>{task.task}</p>
                        <button className="clean-btn material-icons fs-14" onClick={() => this.editTask(e._id, task)}>
                          edit
                        </button>
                      </div>

                      <div className='ml-38'>

                        {/* Due Date */}
                        {(task.due && !task.isFinished) && (
                          <div className='due'>
                            <span className="material-icons">
                              calendar_today
                            </span>
                            <p>Due {moment(task.due).fromNow()}</p>
                          </div>
                        )}

                        {/* Subtasks */}
                        {task.subTasks?.map((sub, subIndex) => (
                          <div className='task' key={"task-" + subIndex}>
                            <input type="checkbox" checked={sub.isFinished} className='checkbox' onChange={event => this.toggleCheckSubTask(event, task, e._id, subIndex)} />
                            <p className={sub.isFinished ? "strike" : ""}>{sub.task}</p>
                          </div>
                        ))}

                      </div>

                    </div>
                  ))}

                  {/* Add Task */}
                  <div className='write'>
                    <input type="checkbox" className='checkbox' disabled />
                    <input className='input' placeholder='Write a task...'
                      value={e.input}
                      onChange={event => this.onChange(event, i)}
                      onKeyDown={event => this.submit(event, e._id)}
                    />

                  </div>

                </div>
              )}

            </div>
          ))}
        </div>

      </>
    )
  }
}