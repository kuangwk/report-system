import React, { Component } from 'react'
import Reactdom from 'react-dom'
import axios from 'axios'
import { List, Input, Form, Button, message } from 'antd'

import './index.css'

export default class HomePage extends Component {

  constructor () {
    super()
    this.state = {
      list: []
    }
  }

  async componentDidMount () {
    try {
      const { data } = await axios.get('/api/projects')
      console.log('projects', data)
      this.setState({
        list: data
      })
    } catch (error) {
      message.error('拉取项目列表失败')
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    const value = this.Input.input.value
    try {
      await axios.post('/api/project/add', { project: value })
    } catch (error) {
      const response = error.response || {}
      if (response.status === 401) {
        message.error(`已经有名称为“${value}”项目了`)
      } else {
        message.error('添加项目失败')
      }
    }
  }

  async handleLogout() {
    const { status } = await axios.get('/api/user/logout')
    if (status === 200) {
      window.location.reload()
    }
  }

  render () {
    const { list } = this.state;
    return (
      <div className='container'>
        <header className='header'>
          <h1>项目列表</h1>
          <Button className='logout-button' onClick={this.handleLogout} type="danger">
            退出
          </Button>
        </header>
        <Form onSubmit={this.handleSubmit.bind(this)} >
          <Form.Item>
            <Input
              className='project-input'
              name='project'
              style={{width: 200}}
              ref={(Input)=> this.Input = Input}
            />
            <Button
              type='primary'
              htmlType="submit"
            >
              添加
            </Button>
          </Form.Item>
        </Form>
        <List
          className='project-list'
          dataSource={list}
          bordered
          renderItem={ item => (
            <List.Item key={item._id}>
              <a href={`/project/${item._id}`}>{item.name} </a>
            </List.Item>
          )}
        />
      </div>
    )
  }
}