import React from 'react';
import { Chart } from "react-google-charts";
import donors from "../public/donors.json";
import recipients from "../public/recipients.json";
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

const options = {
  focusTarget: 'category',
  tooltip: {isHtml: true},
  sankey: {
    focusTarget: 'category',
    tooltip: {isHtml: true},
    node: {
      interactivity: true,
    },
    link: {
      colorMode: "gradient",
      colors: ['#a6cee3', '#b2df8a', '#fb9a99', '#fdbf6f',
      '#cab2d6', '#ffff99', '#1f78b4', '#33a02c'],
      interactivity: false
    },
  },
};
const chartEvents = [
    {
      eventName: "select",
      callback: ({ chartWrapper }) => {
        const chart = chartWrapper.getChart();
        const selection = chart.getSelection();
        console.log("Selected", selection);
        /*if (selection.length === 1) {
          const [selectedItem] = selection;
          const dataTable = chartWrapper.getDataTable();
          const { row, column } = selectedItem;
  
          console.log("You selected:", {
            row,
            column,
            value: dataTable?.getValue(row, column),
          });
        }*/
      },
    },
  ];

export default function Sankey() {
  const [orderBy, setOrderBy] = React.useState('donor');
    //const data = [
    //    ["From", "To", "Weight"],
    //    ...donors.map(d => [d.donor, recipients[d.match].recipient, d.amount])
    //];
    const tot = donors.reduce((m, d) => m + d.amount, 0);
    const summary = (orderBy == 'donor')?summarizeDonors(donors, recipients):summarizeRecipients(recipients, donors);
    const ordered = Object.keys(summary).sort((a, b) => summary[b].total - summary[a].total);
    const data = (orderBy == 'donor')?donorData(ordered, summary, tot):recipientData(ordered, summary, tot);
    console.log(ordered);
    return (
      <Box sx={{width: '100%'}}>
        <Container sx={{width: '50%', minWidth:'400px'}}>
        {(orderBy == 'donor'?'Showing Top Donors':'Showing Top Recipients')} &nbsp;&nbsp;&nbsp;
          <Button variant="contained" onClick={() => setOrderBy(orderBy == 'donor'?'recipient':'donor')}>Switch</Button>
        </Container>
        <Container>
          <div style={{width: "100%", height: "100%"}}>
            
          <Chart
            chartType="Sankey"
            width="100%"
            height="800px"
            data={data.slice(0, 100)}
            options={options}
            chartEvents={chartEvents}
          />
          </div>
        </Container>
      </Box>
    );
}

function summarizeDonors(from, to) {
    return from.reduce((m, f) => {
        if (!m[f.donor]) m[f.donor] = {count: 0, total: 0, recipients: {}};
        m[f.donor].count++;
        m[f.donor].total += f.amount;
        const match = to[f.match];
        if (!m[f.donor].recipients[match.recipient]) 
            m[f.donor].recipients[match.recipient] = {count: 0, total: 0};
        m[f.donor].recipients[match.recipient].count++;
        m[f.donor].recipients[match.recipient].total += f.amount;
        return m;
    }, {});
}
function summarizeRecipients(to, from) {
    return to.reduce((m, t) => {
        if (!m[t.recipient]) m[t.recipient] = {count: 0, total: 0, donors: {}};
        m[t.recipient].count++;
        m[t.recipient].total += t.amount;
        const match = from[t.match];
        if (!m[t.recipient].donors[match.donor]) 
            m[t.recipient].donors[match.donor] = {count: 0, total: 0};
        m[t.recipient].donors[match.donor].count++;
        m[t.recipient].donors[match.donor].total += t.amount;
        return m;
    }, {});
}
const fmtinr = n => new Intl.NumberFormat('en-IN', { 
                                                      style: 'currency', 
                                                      currency: 'INR',
                                                      minimumFractionDigit: 0,
                                                      maximumFractionDigits: 0,
                                                      notation: 'compact',
                                                      compactDisplay: 'long',
                                                    }).format(n);
const mktt = (donor, recipient, r) => {
  return `<div style="padding: 10px; background-color: #f0f0f0; border: 1px solid #ccc">
        <div style="font-weight: bold">${donor} to ${recipient}</div>
        <div>${fmtinr(r.total)} total in ${r.count} transactions</div>
        </div>`;
}

function donorData(ordered, summary, tot) {
    return     [
      [{type: "string", label: "From"}, {type: "string", label: "To"}, {type: "number", label: "Weight"}, {type: "string", role: "tooltip", p: {html: true}}, 
          {type: "number", id: "lindex"}, {type: "number", id: "rindex"}], 
      ...ordered.flatMap((donor, lndx) => {
          const total = summary[donor].total;
          if (total < tot/100) return;
          return Object.keys(summary[donor].recipients).map(recipient => {
              const r = summary[donor].recipients[recipient];
              if (r.total < total/10) return;
              return [donor, recipient, r.total, mktt(donor, recipient, r), lndx, lndx];
          }).filter(Boolean);
      }).filter(Boolean)
  ];
}

function recipientData(ordered, summary, tot) {
    return     [
      [{type: "string", label: "To"}, {type: "string", label: "From"}, {type: "number", label: "Weight"}, {type: "string", role: "tooltip", p: {html: true}}, 
          {type: "number", id: "lindex"}, {type: "number", id: "rindex"}], 
      ...ordered.flatMap((recipient, lndx) => {
          const total = summary[recipient].total;
          //if (total < tot/100) return;
          /*return Object.keys(summary[recipient].donors).map(donor => {
              const r = summary[recipient].donors[donor];
              if (r.total < total/10) return;
              return [recipient, donor, r.total, mktt(donor, recipient, r), lndx, lndx];
          }).filter(Boolean);*/
          return trimDonors(recipient, summary[recipient].donors, Math.min(tot/100, total/10), lndx, 10);
      }).filter(Boolean)
  ];
}

function trimDonors(recipient, donors, min, lndx, n) {
  const ordered = Object.keys(donors).sort((a, b) => donors[b].total - donors[a].total);
  let ign = false;
  let ret = ordered.slice(0, n).map((donor, rndx) => {
      const r = donors[donor];
      if (r.total < min) {
        ign = true;
        return;
      }
      return [recipient, donor, r.total, mktt(donor, recipient, r), lndx, lndx];
    }).filter(Boolean);
  if (ign || Object.keys(donors).length > n) {
    const others = ordered.slice(ret.length).reduce((m, d) => {
      m.total += donors[d].total;
      m.count += donors[d].count;
      return m;
    }, {total: 0, count: 0});
    ret.push([recipient, 'Others', others.total, mktt('Others', recipient, others), lndx, lndx]);
  }
  return ret;
}
