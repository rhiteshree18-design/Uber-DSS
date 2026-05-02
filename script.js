let chart;
let barChart;

async function predictTrips() {

    let hour = document.getElementById("hour").value;

    if (hour === "" || hour < 0 || hour > 23) {
        document.getElementById("result").innerHTML =
            "⚠ Please enter valid hour (0-23)";
        return;
    }

    try {

        let response = await fetch("http://127.0.0.1:5000/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                hour: hour
            })
        });

        let data = await response.json();

        // Prediction Result
        document.getElementById("result").innerHTML =
            "🚖 Predicted Trips = <b>" + data.predicted_trips + "</b>";

        // Drivers Needed
        document.getElementById("drivers").innerHTML =
            data.drivers_needed;

        // Revenue Forecast
        let revenue = data.predicted_trips * 250;

        document.getElementById("revenueTrip").innerHTML =
            "₹" + revenue;

        // Demand Status
        if (data.predicted_trips < 100) {
            document.getElementById("status").innerHTML = "Low";
        }
        else if (data.predicted_trips < 300) {
            document.getElementById("status").innerHTML = "Normal";
        }
        else {
            document.getElementById("status").innerHTML = "High";
        }

        // Draw Charts
        drawChart(data.predicted_trips);
        drawBarChart(data.predicted_trips);

    }
    catch (error) {

        document.getElementById("result").innerHTML =
            "❌ Backend not connected";

        console.log(error);

    }

}

/* Line Graph */
function drawChart(value) {

    let ctx = document.getElementById("myChart").getContext("2d");

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: "line",

        data: {
            labels: ["Current", "Prediction"],
            datasets: [{
                label: "Trips Forecast",
                data: [0, value],
                tension: 0.4,
                fill: true,
                borderColor: "white",
                backgroundColor: "rgba(255,255,255,0.15)",
                borderWidth: 3,
                pointRadius: 5,
                pointBackgroundColor: "white",
                pointBorderColor: "white"
            }]
        },

        options: {
            responsive: true,

            plugins: {
                legend: {
                    labels: {
                        color: "white"
                    }
                }
            },

            scales: {

                x: {
                    title: {
                        display: true,
                        text: "Prediction Stage",
                        color: "white",
                        font: {
                            size: 16,
                            weight: "bold"
                        }
                    },
                    ticks: {
                        color: "white"
                    },
                    grid: {
                        color: "rgba(255,255,255,0.15)"
                    }
                },

                y: {
                    beginAtZero: true,
                    ticks: {
                        color: "white"
                    },
                    title: {
                        display: true,
                        text: "Trips",
                        color: "white"
                    },
                    grid: {
                        color: "rgba(255,255,255,0.15)"
                    }
                }

            }
        }
    });

}

/* Bar Chart */
function drawBarChart(value) {

    let hour = parseInt(document.getElementById("hour").value);

    let ctx = document.getElementById("barChart").getContext("2d");

    if (barChart) {
        barChart.destroy();
    }

    let labels = [
        (hour - 2 + 24) % 24,
        (hour - 1 + 24) % 24,
        hour,
        (hour + 1) % 24,
        (hour + 2) % 24
    ];

    let trips = [
        Math.max(0, value - 100),
        Math.max(0, value - 40),
        value,
        Math.max(0, value - 20),
        Math.max(0, value - 60)
    ];

    barChart = new Chart(ctx, {
        type: "bar",

        data: {
            labels: labels.map(h => h + ":00"),
            datasets: [{
                label: "Trips Comparison",
                data: trips,
                backgroundColor: [
                    "#38bdf8",
                    "#38bdf8",
                    "#ef4444",
                    "#38bdf8",
                    "#38bdf8"
                ],
                borderRadius: 10
            }]
        },

        options: {
            responsive: true,

            plugins: {
                legend: {
                    labels: {
                        color: "white"
                    }
                }
            },

            scales: {

                x: {
                    ticks: {
                        color: "white"
                    },
                    title: {
                        display: true,
                        text: "Nearby Hours",
                        color: "white"
                    },
                    grid: {
                        color: "rgba(255,255,255,0.15)"
                    }
                },

                y: {
                    min: Math.max(0, Math.min(...trips) - 150),
                    max: Math.max(...trips) + 150,

                    ticks: {
                        color: "white"
                    },

                    title: {
                        display: true,
                        text: "Trips",
                        color: "white"
                    },

                    grid: {
                        color: "rgba(255,255,255,0.15)"
                    }
                }

            }
        }
    });

}