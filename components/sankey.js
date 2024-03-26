import React from 'react';
import { Chart } from "react-google-charts";
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Slider from '@mui/material/Slider';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

import donors from "../public/donors.json";
import recipients from "../public/recipients.json";

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
  const [startDate, setStartDate] = React.useState(dayjs('2019-04-01'));
  const [endDate, setEndDate] = React.useState(dayjs('2024-01-31'));
  const [minAmount, setMinAmount] = React.useState(0);
  const [filterName, setFilterName] = React.useState('');
  const [maxBreakdown, setMaxBreakdown] = React.useState(30);

  const tot = ((orderBy == 'donor')?donors:recipients).reduce((m, d) => m + d.amount, 0);
  const opts = { orderBy, startDate, endDate, minAmount, filterName, maxBreakdown, tot };
  console.log("Options", opts);
  const summary = (orderBy == 'donor')?summarizeDonors(donors, recipients, opts):summarizeRecipients(recipients, donors, opts);
  const ordered = Object.keys(summary).sort((a, b) => summary[b].total - summary[a].total);
  const data = trim((orderBy == 'donor')?donorData(ordered, summary, opts):recipientData(ordered, summary, opts), opts);
  const bonds = bdict(donors, recipients);
  const stats = mkStats(data, bonds, opts);
  //console.log(ordered);
  console.log({data});
  return (
    <Box sx={{width: '100%'}}>
      <Container sx={{width: '100%', minWidth:'400px', align: 'left', py: 5}}>
      <Accordion>
      <AccordionSummary
        expandIcon={<ArrowDownwardIcon />}
      >
        <Typography>Options <Button variant="contained" size="small">Reset</Button></Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          <span>
                {(orderBy == 'donor'?'Showing Top Donors':'Showing Top Recipients')} &nbsp;&nbsp;&nbsp;
                <Button variant="contained" onClick={() => setOrderBy(orderBy == 'donor'?'recipient':'donor')}>Switch</Button>
          </span>
          <span>
            Date Range: <DatePicker value={startDate} onChange={v => setStartDate(dayjs(v))} /> - <DatePicker value={endDate} onChange={v => setEndDate(dayjs(v))} />
          </span>
          <span>
            Ignore Bonds less than <Select value={minAmount} onChange={evt => setMinAmount(evt.target.value)}>
              {[0, 1e3, 1e4, 1e5, 1e6, 1e7].map(n => <MenuItem key={n} value={n}>{fmtinr(n)}</MenuItem>)}
            </Select>
          </span>
          <span>
            <span>Show only top {maxBreakdown} donors and recipients</span>
            <Slider value={maxBreakdown} onChange={(_, v) => setMaxBreakdown(v)} min={5} max={100} step={1} valueLabelDisplay="auto" />
          </span>

        </Stack>
      </AccordionDetails>
    </Accordion>
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

function bid(d) {
  return `${d.prefix}${d.uid}`;
}
function bdict(from, to) {
  return from.concat(to).reduce((m, f) => {
    const id = bid(f);
    if (!m[id])
      m[id] = f;
    else
    m[id] = {...m[id], ...f};
    return m;
  });
}
function summarizeDonors(from, to, opts) {
    return from.reduce((m, f) => {
        if (f.amount < opts.minAmount) return m;
        if (opts.startDate.diff(f.purchase_date) >= 0 || opts.endDate.diff(f.purchase_date) <= 0) return m;
        if (opts.filterName != '' && f.donor == opts.filterName) return m;
        if (!m[f.donor]) m[f.donor] = {count: 0, total: 0, recipients: {}};
        m[f.donor].count++;
        m[f.donor].total += f.amount;
        const match = to[f.match];
        if (!m[f.donor].recipients[match.recipient]) 
            m[f.donor].recipients[match.recipient] = {count: 0, total: 0, bonds: []};
        m[f.donor].recipients[match.recipient].count++;
        m[f.donor].recipients[match.recipient].total += f.amount;
        m[f.donor].recipients[match.recipient].bonds.push(bid(f));
        return m;
    }, {});
}
function summarizeRecipients(to, from, opts) {
    return to.reduce((m, t) => {
      if (t.amount < opts.minAmount) return m;
      if (opts.startDate.diff(t.redeem_date) >= 0 || opts.endDate.diff(t.redeem_date) <= 0) return m;
      if (opts.filterName != '' && t.recipient == opts.filterName) return m;
      if (!m[t.recipient]) m[t.recipient] = {count: 0, total: 0, donors: {}};
        m[t.recipient].count++;
        m[t.recipient].total += t.amount;
        const match = from[t.match];
        if (!m[t.recipient].donors[match.donor]) 
            m[t.recipient].donors[match.donor] = {count: 0, total: 0, bonds: []};
        m[t.recipient].donors[match.donor].count++;
        m[t.recipient].donors[match.donor].total += t.amount;
        m[t.recipient].donors[match.donor].bonds.push(bid(t));
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
          {type: "string", id: "uid"}], 
      ...ordered.flatMap((donor, lndx) => {
          const total = summary[donor].total;
          return Object.keys(summary[donor].recipients).map(recipient => {
              const r = summary[donor].recipients[recipient];
              return [donor, recipient, r.total, mktt(donor, recipient, r), "tbd"];
          }).filter(Boolean);
      }).filter(Boolean)
  ];
}

function recipientData(ordered, summary, tot) {
    return     [
      [{type: "string", label: "To"}, {type: "string", label: "From"}, {type: "number", label: "Weight"}, {type: "string", role: "tooltip", p: {html: true}}, 
          {type: "string", id: "uid"}], 
      ...ordered.flatMap((recipient, lndx) => {
          const total = summary[recipient].total;
          return Object.keys(summary[recipient].donors).map(donor => {
              const r = summary[recipient].donors[donor];
              return [recipient, donor, r.total, mktt(donor, recipient, r), "tbd"];
          }).filter(Boolean);
      }).filter(Boolean)
  ];
}

function trim(data, opts)  {
  let f = {}, t = {};
  data.slice(1).forEach(d => {
    f[d[0]] = (f[d[0]] || 0) + d[2];
    t[d[1]] = (t[d[1]] || 0) + d[2];
  });
  const F = Object.keys(f).sort((a, b) => f[b] - f[a]).slice(0, opts.maxBreakdown);
  const T = Object.keys(t).sort((a, b) => t[b] - t[a]).slice(0, opts.maxBreakdown);
  const ordered = data.filter((d, i) => (i != 0) && F.includes(d[0]) && T.includes(d[1]))
                      .sort((a, b) => (F.indexOf(a[0]) - F.indexOf(b[0])) || (T.indexOf(a[1]) - T.indexOf(b[1])));
  return  [data[0]].concat(ordered);
}

function mkStats(data, bonds, opts) {
  const total = data.slice(1).reduce((m, d) => m + d[2], 0);
  return {total, count: data.length - 1, donors: data.slice(1).map(d => d[0]).filter((v, i, a) => a.indexOf(v) === i).length, 
          recipients: data.slice(1).map(d => d[1]).filter((v, i, a) => a.indexOf(v) === i).length};
} 
