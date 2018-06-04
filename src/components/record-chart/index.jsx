import React, { Component } from 'react'
import axios from 'axios'
import { Chart, Geom, Axis, Tooltip, Legend, Coord, track} from 'bizcharts'
import DataSet from '@antv/data-set';
import { Radio } from 'antd'
import moment from 'moment'

import './index.less'

import { SECOND, MINUTE, HOUR, DAY, REAL_TIME_VIEW, MONTH_VIEW} from '../../../common/constant'

// 一天内分钟数转化为固定年月日的 timestamp, 方便画图
function toFixedTs(minutesSinceMidNight) {
  const timeStr = minutesToTime(minutesSinceMidNight)
  return moment(`2018-01-01 ${timeStr}`, 'YYYY-MM-DD HH:mm').valueOf()
}

function minutesToTime(minutesSinceMidNight) {
  const hours = Math.floor(minutesSinceMidNight / 60)
  const minutes = minutesSinceMidNight % 60
  return `${toFixedTwo(hours)}:${toFixedTwo(minutes)}`
}

function toFixedTwo(num) {
  return num < 10 ? '0' + num : num
}

function getCols(options) {
  const { count = {}, time = {} } = options
  return {
    count: { alias: '上报量', ...count},
    time: { alias: '时间', type: 'time', ...time }
  }
}

function getRealTimeChartCols() {
  const pointInterval = 5 // 多少分钟打一个点
  const start = 0
  const end = DAY / MINUTE // 一天多少分钟
  // 定义度量
  const cols = getCols({
    count: {
      alias: `每${pointInterval == 1 ? '': pointInterval}分钟上报量`
    },
    time: {
      type: 'time',
      formatter: (ts)=> {
        const NEXT_DAY = '2018-01-02'
        return (moment(ts).format('YYYY-MM-DD') === NEXT_DAY) ? '24:00' : moment(ts).format('HH:mm')
      }
    },
  })
  return { start, end, pointInterval, cols }
}

function getDayChartConfig() {
  const pointInterval = DAY
  const endTime = new Date().setHours(0, 0, 0, 0)
  const startTime = endTime - 30 * DAY
  // 定义度量
  const cols = getCols({
    time: {
      formatter: (value)=> {
        return moment(value).format('MM-DD')
      }
    },
  })
  return { startTime, endTime, pointInterval, cols }
}

function getCountOfTs(endTime, startTime, interval) {
  return parseInt((endTime - startTime) / interval)
}

function formatDayChartData(records) {
  const { startTime, endTime, pointInterval, cols } = getDayChartConfig()
  const pointsCount = getCountOfTs(endTime, startTime, pointInterval)
  const pointArr = (Array.from(new Array(pointsCount))).map((item, index)=> {
    const point = startTime + index * pointInterval
    return {
      time: point,
      count: 0
    }
  })
  records.forEach((record)=> {
    const ts = new Date(record.reportTime)
    const index = getCountOfTs(ts, startTime, pointInterval)
    // 超出刻度的还没统计，先不要
    if (pointArr[index]) {
      pointArr[index].count += record.count
    }
  })
  return {
    cols,
    data: pointArr
  }
}

function getMinutesOfDay(time) {
  if (!time.getHours) {
    time = new Date(time)
  }
  return time.getHours() * 60 + time.getMinutes()
}

function isToday(ts) {
  return moment(ts).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')
}

function isYesterday(ts) {
  return moment(ts + DAY).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')
}

function formatRealTimeChartData(records) {
  const { start, end, pointInterval, cols } = getRealTimeChartCols()
  const pointArr = getInitialPointArray(start, end, pointInterval)
  const fileds = ['today', 'yesterday']
  putRecordToPointArray(records, pointArr, pointInterval)
  const ds = new DataSet();
  const dv = ds.createView().source(pointArr);
  dv.transform({
    type: 'fold',
    fields: fileds, // 展开字段集
    key: 'date', // key字段
    value: 'count', // value字段
  });
  return {
    cols,
    data: dv
  }
}

function getInitialPointArray(start, end, pointInterval) {
  const totalPointCount = getCountOfTs(end, start, pointInterval)
  const todayPointCount = getCountOfTs(getMinutesOfDay(new Date()), start, pointInterval)
  const pointArr = Array.from(new Array(totalPointCount + 1)).map((_, index) => {
    const point = {
      time: toFixedTs(start + index * pointInterval)
    }
    point.yesterday = 0
    index < todayPointCount && (point.today = 0)
    return point
  })
  return pointArr
}

function putRecordToPointArray(records, pointArr, pointInterval) {
  const nowIndex = parseInt( getMinutesOfDay(Date.now()) / pointInterval )
  records.forEach((record)=> {
    const timeStamp = +new Date(record.reportTime)
    const minuteNumber = getMinutesOfDay(timeStamp)
    const field = getField(timeStamp)
    const index = parseInt(minuteNumber / pointInterval)
    if (field && pointArr[index]) {
      if (field === 'today' && index >= nowIndex) return // 当前几分钟不显示
      if (!pointArr[index][field]) { pointArr[index][field] = 0 }
      pointArr[index][field] += record.count
    }
  })
}

function getField(ts) {
  return isToday(ts) ? 'today' : ( isYesterday(ts) ? 'yesterday' : '' )
}

function formatChartData(records, chartType) {
  if (chartType === REAL_TIME_VIEW) {
    return formatRealTimeChartData(records)
  } else {
    return formatDayChartData(records)
  }
}

class RecordChart extends Component {
  constructor (props) {
    super()
    this.state = {
      chartType: 0,
      data: null
    }
  }

  getFetchConfig () {
    const { chartType }  = this.state
    let endTs = Date.now()
    let startTs
    if (chartType === REAL_TIME_VIEW) {
      startTs = +new Date(endTs).setHours(0, 0, 0, 0)
    } else if (chartType === MONTH_VIEW) {
      const interval = 30 * DAY
      startTs = endTs - interval
    }
    return {
      startTs,
      endTs,
      type: chartType
    }
  }

  async fetchRecords () {
    this.setState({ data: null }) // 清空图表，数据回来后重新渲染
    const { action, appId } = this.props
    const { chartType } = this.state
    const config = this.getFetchConfig()
    const { data: records} = await axios.get('/api/records', {
      params: Object.assign({
        action,
        appId,
      }, config)
    })
    const {data, cols} = formatChartData(records, chartType)
    this.setState({
      data,
      cols
    })
  }

  componentWillMount() {
    // 关闭 G2 的体验改进计划打点请求
    track(false);
  }

  componentDidUpdate(preProps, preState) {
    if (preProps.action !== this.props.action) {
      this.fetchRecords()
    }
    if (preState.chartType !== this.state.chartType) {
      this.fetchRecords()
    }
  }

  componentDidMount() {
    this.fetchRecords()
  }

  handleCharTypeChange(e) {
    this.setState({
      chartType: e.target.value
    })
  }

  render() {
    const { data, cols, chartType } = this.state
    return (
      <section className="chart-container">
        <div className="type-radio-container">
          <Radio.Group className="type-radio" value={chartType} onChange={this.handleCharTypeChange.bind(this)}>
              <Radio.Button value={0}>实时</Radio.Button>
              <Radio.Button value={2}>月视图</Radio.Button>
            </Radio.Group>
        </div>
        { data &&
          <Chart forceFit height={400} data={data} scale={cols}>
            <Legend />
            <Axis name="time" />
            <Axis name="count" title />
            <Tooltip crosshairs={{type : "y"}}/>
            <Geom
              type="line"
              position="time*count"
              size={2}
              shape={'smooth'}
              color={ chartType === REAL_TIME_VIEW ?  'date' : undefined }
            />
          </Chart>
        }
      </section>
    )
  }
}

export default RecordChart