const fetch = require("node-fetch");
const axios = require("axios");
const os = require("os");
const { exec } = require("child_process");

const getBuffer = async (url, options) => {
    try {
        options ? options : {};
        const res = await axios({
            method: "get",
            url,
            headers: {
                'DNT': 1,
                'Upgrade-Insecure-Request': 1
            },
            ...options,
            responseType: 'arraybuffer'
        });
        return res.data;
    } catch (err) {
        return err;
    }
};

module.exports = function (app) {
    app.get('/status', async (req, res) => {
        const { apikey } = req.query;

        if (!global.apikey.includes(apikey)) {
            return res.status(400).json({ status: false, error: 'Apikey invalid' });
        }

        try {
            // Fetch system uptime details
            const uptime = os.uptime(); // System uptime in seconds
            const loadAverage = os.loadavg(); // Load average for 1, 5, 15 minutes
            const freeMemory = os.freemem(); // Free memory in bytes
            const totalMemory = os.totalmem(); // Total memory in bytes
            const memoryUsagePercentage = ((freeMemory / totalMemory) * 100).toFixed(2);

            // Get server status via Vercel's uptime service (or another method if using a different hosting provider)
            const vercelUptimeResponse = await fetch("https://api.vercel.com/v2/now/deployments");
            const vercelUptimeData = await vercelUptimeResponse.json();
            const vercelStatus = vercelUptimeData.deployments && vercelUptimeData.deployments.length > 0
                ? vercelUptimeData.deployments[0].state
                : "unknown";

            // Get the server's CPU information
            const cpuInfo = os.cpus().map(cpu => cpu.model).join(", ");
            
            // Get the current time
            const currentTime = new Date().toISOString();

            // Return server uptime details
            return res.json({
                status: true,
                message: "Server is running",
                current_time: currentTime,
                uptime_in_seconds: uptime,
                load_average: loadAverage,
                free_memory_in_mb: (freeMemory / (1024 ** 2)).toFixed(2),
                memory_usage_percentage: memoryUsagePercentage,
                vercel_status: vercelStatus,
                cpu_info: cpuInfo,
                server_version: "1.0.0" // Example version
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: false, error: 'Failed to fetch server status' });
        }
    });
};
