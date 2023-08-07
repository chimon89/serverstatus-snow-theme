import {Fragment, useEffect, useState} from 'react';
import './App.css'
import {formatBytes, timeSince} from './utils/transform';

function App () {
  const [stats, setStats] = useState()

  const [activeElement, setActiveElement] = useState('')

  const areaList = [
    "AD","AE","AG","AM","AR","AT","AU","BE","BF","BG","BO","BR","CA","CD","CG","CH","CL","CM","CN","CO","CZ","DE","DJ","DK","DZ","EE","EG","ES","FL","FR","GA","GB","GM","GT","HK","HN","HT","HU","ID","IE","IL","IN","IQ","IR","IT","JM","JO","JP","KG","KN","KP","KR","KW","KZ","LA","LB","LC","LS","LU","LV","MG","MK","ML","MM","MT","MX","NA","NE","NG","NI","NL","NO","OM","PA","PE","PG","PH","PK","PL","PT","PY","QA","RO","RU","RW","SA","SE","SG","SL","SN","SO","SV","TD","TJ","TL","TR","TW","TZ","UA","US","VE","VN","YE"
  ]

  useEffect(()=>{
    const timer = setInterval(async ()=>{
      const result = await fetch("/json/stats.json")
      const data = await result.json()
      setStats(data)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return <div className="App container mx-auto">

    <div className="navbar bg-base-100">
      <a className="btn btn-ghost normal-case text-xl">Monitor</a>
    </div>

    <div className="overflow-x-auto mx-4">
      <table className="table">
        <thead>
        <tr>
          <th>运行状态</th>
          <th>月流量</th>
          <th>节点名称</th>
          <th>虚拟化</th>
          <th>在线时长</th>
          <th>负载</th>
          <th>网络↓|↑</th>
          <th>总流量↓|↑</th>
          <th>CPU</th>
          <th>MEM</th>
          <th>SPACE</th>
          <th>CU/CT/CM 丢包率</th>
        </tr>
        </thead>
        <tbody>
        {
          stats != null && stats.servers.length > 0 && stats.servers.map((item,index) => <Fragment key={`node_${index}`}>
            <tr className="hover" onClick={()=>{
              activeElement != `node_${index}` ? setActiveElement(`node_${index}`) : setActiveElement('')
            }}>
              <td>
                {item.online4 && item.online6 && '双栈'}
                {item.online4 && !item.online6 && 'IPv4'}
                {!item.online4 && item.online6 && 'IPv6'}
                {!item.online4 && !item.online6 && <span className='text-error'>离线</span>}
              </td>
              <td>{formatBytes(item.last_network_in)} | {formatBytes(item.last_network_out)}</td>
              <td className="flex items-center gap-1">{areaList.indexOf(item.location) > 0 && <img src={`/img/clients/${item.location}.png`} style={{height: "1rem"}}></img> } {item.name}</td>
              <td>{item.type}</td>
              <td>{item.uptime}</td>
              <td>{item.load_1}</td>
              <td>{formatBytes(item.network_rx, 1)} | {formatBytes(item.network_tx, 1)}</td>
              <td>{formatBytes(item.network_in, 1)} | {formatBytes(item.network_out, 1)}</td>
              <td>
                {
                  item.cpu == null ? ''
                    : item.cpu >= 90 ? <progress className="progress progress-error" value={item.cpu} max="100"></progress>
                    : (item.cpu >= 75 ? <progress className="progress progress-warning" value={item.cpu} max="100"></progress>
                      : <progress className="progress progress-success" value={item.cpu} max="100"></progress>)
                }
              </td>
              <td>
                {
                  item.memory_used == null ? ''
                    : <progress className="progress" value={item.memory_used} max={item.memory_total}></progress>
                }
              </td>
              <td>
                {
                  item.hdd_used == null ? ''
                    : <progress className="progress" value={item.hdd_used} max={item.hdd_total}></progress>
                }
              </td>
              <td>
                { (item.ping_10010 == null || item.ping_189 == null || item.ping_10086 == null) ? '离线'
                  : (item.ping_10010 > 20 || item.ping_189 > 20 || item.ping_10086 > 20) ? <div className="badge badge-error">{item.ping_10010}%💻{item.ping_189}%💻{item.ping_10086}%</div>
                  : (item.ping_10010 > 10 || item.ping_189 > 10 || item.ping_10086 > 10) ? <div className="badge badge-warning">{item.ping_10010}%💻{item.ping_189}%💻{item.ping_10086}%</div>
                  : <div className="badge badge-success">{item.ping_10010}%💻{item.ping_189}%💻{item.ping_10086}%</div>
                }
              </td>
            </tr>
            <tr className={
              activeElement == `node_${index}` ? '' : 'hidden'
            }>
              <td colSpan="16">
                <div className="text-center">
                  {
                    (item.online4 && item.online6) ? <>
                      <div>内存/虚存：{formatBytes(item.memory_used*1024,1)} / {formatBytes(item.memory_total*1024,1)} | {formatBytes(item.swap_used*1024,1)} / {formatBytes(item.swap_total*1024,1)}</div>
                      <div>硬盘读写：{formatBytes(item.hdd_used)} / {formatBytes(item.hdd_total)} | {formatBytes(item.io_read,1)} / {formatBytes(item.io_write,1)}</div>
                      <div>TCP/UDP/进/线：{item.tcp_count} / {item.udp_count} / {item.process_count} / {item.thread_count}</div>
                      <div>联通/电信/移动：{item.time_10010}ms / {item.time_189}ms / {item.time_10086}ms</div>
                      <div>丢包：联通/电信/移动：{item.ping_10010}% / {item.ping_189}% / {item.ping_10086}%</div>
                    </> : '离线'
                  }
                </div>
              </td>
            </tr>
          </Fragment>)
        }
        </tbody>
      </table>
    </div>

    <p className="mx-6 my-4 text-sm">最近更新于 {stats != null && timeSince(new Date(stats.updated*1000))}</p>

    <p className="fixed bottom-0 right-2">
      © Chimon Network {new Date().getFullYear()}
    </p>
  </div>
}

export default App;