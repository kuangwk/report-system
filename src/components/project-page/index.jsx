import React, { Component } from 'react'
import axios from 'axios';
import { message, Modal, Menu } from 'antd';

import { getHash } from '../../util'

import './index.less'
import RecordChart from '../record-chart';

class ProjectPage extends Component {
  constructor({ match }) {
    super()
    const curAction = getHash('action') || ''
    this.state = {
      appId: match.params.appId,
      project: {},
      actions: [],
      records: [],
      curAction
    }
  }
  async componentDidMount() {
    const { appId, curAction } = this.state
    try {
      const { data } = await axios.get(`/api/project/${appId}`)
      const firstAction = data.actions[0] ? data.actions[0].action : ''
      this.setState({
        project: data.project,
        actions: data.actions,
        curAction: curAction || firstAction
      })
    } catch (err) {
      let message
      if (err.request && err.request.status === 401) {
        message = '找不到项目'

      } else {
        message = '拉取项目失败'
      }
      Modal.error({
        title: message,
        okText: '确定',
        onOk: ()=> {
          window.location.href = '/'
        }
      })
    }
  }

  handleClick (e) {
    this.setState({
      curAction: e.key
    })
    location.hash = `action=${e.key}`
  }

  renderContent() {
    const { appId, project, actions, curAction, records } = this.state
    return (
      <content>
        <Menu
          mode="inline"
          onClick={this.handleClick.bind(this)}
          selectedKeys={[curAction]}
          className='actions-menu'
        >
          {
            actions.map((item)=> {
              return (
                <Menu.Item key={item.action}>{item.action}</Menu.Item>
              )
            })
          }
        </Menu>
        <section className='chart-section'>
          { appId && curAction &&
            <RecordChart
              appId={appId}
              action={curAction}
            />
          }
        </section>
      </content>
    )

  }

  render() {
    const { appId, project } = this.state
    return (
      <div className='project-container'>
        <header>
          <h1>{project.name}</h1>
          <div> appId: {appId} </div>
        </header>
        {this.renderContent()}
      </div>
    )
  }
}

export default ProjectPage