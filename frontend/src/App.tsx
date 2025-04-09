import { useState } from "react"

function App() {
  const [host, setHost] = useState("localhost")
  const [port, setPort] = useState("2222")
  const [username, setUsername] = useState("testuser")
  const [password, setPassword] = useState("testpass")
  const [logs, setLogs] = useState("")

  async function post() {
    await fetch("http://localhost:3000/auth", {
      method: "POST",
      body: JSON.stringify({
        host,
        port,
        username,
        password,
        type: "password",
      }),
    })
    const r = await fetch("http://localhost:3000/command")
    setLogs(await r.text())
  }

  return (
    <>
      <div>
        <input
          type="text"
          value={host}
          onChange={(e) => setHost(e.target.value)}
          name="host"
          placeholder="Host"
        />
        <input
          type="text"
          value={port}
          onChange={(e) => setPort(e.target.value)}
          name="port"
          placeholder="Port"
        />
        <input
          type="text"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />
        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <pre>{logs}</pre>
        <button onClick={post}>Submit</button>
      </div>
    </>
  )
}

export default App
