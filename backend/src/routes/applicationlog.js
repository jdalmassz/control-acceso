const express = require('express');
const router = express.Router();
const pool = require('../pool');

router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 50,
            search = '',
            userId = '',
            dateFrom = '',
            dateTo = '',
            messageSource = ''
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const params = [];
        const conditions = [];

        if (search) {
            conditions.push('(log.Message LIKE ? OR log.Details LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        if (userId) {
            conditions.push('log.UserID = ?');
            params.push(userId);
        }

        if (dateFrom) {
            conditions.push('log.UserRealTime >= ?');
            params.push(dateFrom);
        }

        if (dateTo) {
            conditions.push('log.UserRealTime <= ?');
            params.push(dateTo);
        }

        if (messageSource) {
            conditions.push('log.MessageSource = ?');
            params.push(messageSource);
        }

        const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

        const countQuery = `SELECT COUNT(*) as total FROM applicationlog log ${where}`;
        const [countResult] = await pool.query(countQuery, params);
        const total = countResult[0].total;

        const dataQuery = `
            SELECT
                log.ID,
                log.Message,
                log.UserID,
                u.Name as UserName,
                log.UserRealTime,
                log.MessageSource,
                log.Details
            FROM applicationlog log
            LEFT JOIN users u ON log.UserID = u.ID
            ${where}
            ORDER BY log.ID DESC
            LIMIT ? OFFSET ?
        `;

        const [rows] = await pool.query(dataQuery, [...params, parseInt(limit), offset]);

        res.json({
            data: rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error al obtener logs:', error);
        res.status(500).json({ error: 'Error al obtener los registros de log' });
    }
});

router.get('/sources', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT DISTINCT MessageSource FROM applicationlog WHERE MessageSource IS NOT NULL ORDER BY MessageSource'
        );
        res.json(rows.map(r => r.MessageSource));
    } catch (error) {
        console.error('Error al obtener fuentes:', error);
        res.status(500).json({ error: 'Error al obtener fuentes de mensaje' });
    }
});

module.exports = router;
