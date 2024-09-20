// Plot and export graphs, adapted from https://stackoverflow.com/a/71750361/10239789.
const fs = require('fs');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

const width = 800; //px
const height = 800; //px
const backgroundColour = 'transparent';
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour });

const defaults = chartJSNodeCanvas._chartJs.Chart.defaults;
defaults.borderColor = 'rgb(180, 180, 180)';
defaults.color = 'rgb(180, 180, 180)';
defaults.font.size = 24;

async function plot({ title, labels, data, filename }) {
  const configuration = {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'results',
          data: data,
          borderColor: '#f38020',
          backgroundColor: '#f380207f',
        }
      ]
    },
    options: {
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: title ?? 'Benchmark Results',
          padding: 32,
          font: {
            size: 32,
          }
        },
      },
      scales: {
        y: {
          title: {
            display: true,
            text: 'time (ms)',
          },
          ticks: {
            padding: 12,
          }
        }
      }
    },
  };

  async function run(filename) {
    const dataUrl = await chartJSNodeCanvas.renderToDataURL(configuration);
    const base64Image = dataUrl

    var base64Data = base64Image.replace(/^data:image\/png;base64,/, "");


    fs.writeFile(filename, base64Data, 'base64', function (err) {
      if (err) {
        console.log(err);
      }
    });
    return dataUrl
  }

  return await run(filename);
}

module.exports = { plot };
