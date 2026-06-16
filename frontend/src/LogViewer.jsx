import { useState, useEffect, useCallback } from 'react'

const API = '/api/applicationlog'

function getMessageType(msg) {
  const lower = (msg || '').toLowerCase()
  if (lower.includes('inicio de sesión') || lower.includes('login successful')) return 'login'
  if (lower.includes('cierre de sesión') || lower.includes('logout successful')) return 'logout'
  if (lower.includes('editar') || lower.includes('change')) return 'edit'
  return ''
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

export default function LogViewer() {
  const [logs, setLogs] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 50 })
      if (search) params.append('search', search)
      if (dateFrom) params.append('dateFrom', dateFrom)
      if (dateTo) params.append('dateTo', dateTo)

      const res = await fetch(`${API}?${params}`)
      const json = await res.json()
      setLogs(json.data)
      setPagination(json.pagination)
    } catch (err) {
      console.error('Error fetching logs:', err)
    } finally {
      setLoading(false)
    }
  }, [page, search, dateFrom, dateTo])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  useEffect(() => {
    setPage(1)
  }, [search, dateFrom, dateTo])

  const today = new Date().toISOString().slice(0, 10)

  return (
    <div>
      <header>
        <h1>Control de Acceso</h1>
        <span>{pagination.total.toLocaleString()} registros</span>
      </header>

      <div className="filters">
        <input
          type="text"
          placeholder="Buscar en mensaje..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <label>
          Desde:
          <input
            type="datetime-local"
            value={dateFrom}
            max={dateTo || today + 'T23:59'}
            onChange={e => setDateFrom(e.target.value)}
          />
        </label>
        <label>
          Hasta:
          <input
            type="datetime-local"
            value={dateTo}
            min={dateFrom || ''}
            max={today + 'T23:59'}
            onChange={e => setDateTo(e.target.value)}
          />
        </label>
      </div>

      <div className="container">
        {loading ? (
          <div className="loading">Cargando...</div>
        ) : logs.length === 0 ? (
          <div className="empty">No se encontraron registros</div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha/Hora</th>
                  <th>Usuario</th>
                  <th>Mensaje</th>
                  <th>Fuente</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => {
                  const msgType = getMessageType(log.Message)
                  return (
                    <tr key={log.ID} className={msgType ? `msg-${msgType}` : ''}>
                      <td style={{ color: '#484f58' }}>{log.ID}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDate(log.UserRealTime)}</td>
                      <td>
                        <span className="badge badge-source">{log.UserName || `ID: ${log.UserID}`}</span>
                      </td>
                      <td className="message-cell">{log.Message}</td>
                      <td>
                        <span className="badge badge-axis">{log.MessageSource}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <div className="pagination">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                Anterior
              </button>
              <span>
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>
                Siguiente
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
