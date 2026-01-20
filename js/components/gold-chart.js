/**
 * Gold Chart Component
 *
 * Renders bar chart for gold requirements using Chart.js.
 */

const GoldChart = {
    chart: null,
    goldData: {},

    /**
     * Initialize chart with gold data
     * @param {Object} goldByDate - Gold requirements grouped by date
     */
    render(goldByDate) {
        this.goldData = goldByDate;
        this.renderChart();
    },

    /**
     * Render the bar chart
     */
    renderChart() {
        const ctx = document.getElementById('gold-chart');

        // Destroy existing chart if it exists
        if (this.chart) {
            this.chart.destroy();
        }

        // Prepare data for next 30 days
        const chartData = this.prepareChartData();

        // Check if we have any data
        if (chartData.labels.length === 0) {
            document.getElementById('empty-state-chart').classList.remove('hidden');
            ctx.style.display = 'none';
            return;
        }

        document.getElementById('empty-state-chart').classList.add('hidden');
        ctx.style.display = 'block';

        // Create chart
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Oro Requerido (gramos)',
                    data: chartData.values,
                    backgroundColor: chartData.colors,
                    borderColor: chartData.borderColors,
                    borderWidth: 1,
                    borderRadius: 4,
                    barThickness: 'flex',
                    maxBarThickness: 40
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            title: (context) => {
                                const index = context[0].dataIndex;
                                return chartData.fullDates[index];
                            },
                            label: (context) => {
                                const grams = context.parsed.y;
                                return `${grams.toFixed(1)} gramos`;
                            },
                            afterLabel: (context) => {
                                const index = context.dataIndex;
                                const dateKey = chartData.dateKeys[index];
                                const data = this.goldData[dateKey];
                                if (data && data.orders) {
                                    return `${data.orders.length} pedido${data.orders.length !== 1 ? 's' : ''}`;
                                }
                                return '';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 11
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Gramos',
                            font: {
                                size: 12,
                                weight: '500'
                            }
                        },
                        ticks: {
                            callback: (value) => `${value}g`
                        }
                    }
                },
                onClick: (event, elements) => {
                    if (elements.length > 0) {
                        const index = elements[0].index;
                        const dateKey = chartData.dateKeys[index];
                        if (this.goldData[dateKey]) {
                            showOrdersForDate(dateKey);
                        }
                    }
                }
            }
        });
    },

    /**
     * Prepare chart data for next 30 days
     * @returns {Object} Chart data
     */
    prepareChartData() {
        const labels = [];
        const values = [];
        const colors = [];
        const borderColors = [];
        const fullDates = [];
        const dateKeys = [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get all dates with gold requirements, sorted
        const allDates = Object.keys(this.goldData).sort();

        if (allDates.length === 0) {
            return { labels, values, colors, borderColors, fullDates, dateKeys };
        }

        // Find date range (from earliest date to 30 days from now)
        const earliestDate = new Date(allDates[0] + 'T00:00:00');
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 30);

        // Use the earlier of earliestDate or today as start
        const startDate = earliestDate < today ? earliestDate : today;

        // Day names in Spanish
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

        // Generate data for each day in range
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const dateKey = this.formatDateKey(currentDate);
            const data = this.goldData[dateKey];

            if (data && data.grams > 0) {
                // Short label for x-axis
                const day = currentDate.getDate();
                const dayName = dayNames[currentDate.getDay()];
                labels.push(`${day} ${dayName}`);

                // Full date for tooltip
                const monthName = monthNames[currentDate.getMonth()];
                fullDates.push(`${day} ${monthName} ${currentDate.getFullYear()}`);

                values.push(data.grams);
                dateKeys.push(dateKey);

                // Colors based on urgency
                const colorSet = this.getUrgencyColors(dateKey);
                colors.push(colorSet.bg);
                borderColors.push(colorSet.border);
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return { labels, values, colors, borderColors, fullDates, dateKeys };
    },

    /**
     * Get colors based on date urgency
     * @param {string} dateStr - Date string (YYYY-MM-DD)
     * @returns {Object} Color set { bg, border }
     */
    getUrgencyColors(dateStr) {
        const date = new Date(dateStr + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const diffTime = date.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            // Overdue - Red
            return {
                bg: 'rgba(220, 38, 38, 0.7)',
                border: 'rgb(220, 38, 38)'
            };
        } else if (diffDays <= 4) {
            // Urgent - Orange
            return {
                bg: 'rgba(234, 88, 12, 0.7)',
                border: 'rgb(234, 88, 12)'
            };
        }
        // Normal - Blue
        return {
            bg: 'rgba(37, 99, 235, 0.7)',
            border: 'rgb(37, 99, 235)'
        };
    },

    /**
     * Format date key (YYYY-MM-DD)
     * @param {Date} date
     * @returns {string} Date key
     */
    formatDateKey(date) {
        const y = date.getFullYear();
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const d = date.getDate().toString().padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
};
