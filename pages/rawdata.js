import Head from 'next/head';
import styles from '../styles/Home.module.css';

import { Box, Container, Paper } from '@mui/material';
import { TableContainer, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import SyntaxHighlighter from 'react-syntax-highlighter';

export default function RawData() {
  return (
    <div className={styles.container}>
      <Head>
      <title>Electoral Bonds Data: Downloads</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box>
          <TableContainer sx={{ width: '100%' }} component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>File</TableCell>
                  <TableCell>Schema</TableCell>
                  <TableCell>Download</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                <TableCell>Donors</TableCell>
                  <TableCell>
                  <SyntaxHighlighter language="json">
                    {`
                    [{
                        "serial_no": "1", // same as in SBI file
                        "ref_no": "00001201904120000001166", // -- " --
                        // All dates have been set to 9:00 AM IST of the date in the SBI file
                        "journal_date": "2019-04-12T03:30:00.000Z",  // -- " --
                        "purchase_date": "2019-04-12T03:30:00.000Z", // -- " --
                        "expiry_date": "2019-04-26T03:30:00.000Z", // -- " --
                        "donor": "A B C INDIA LIMITED", //  aka "Purchaser"
                        "prefix": "TL", // same as in SBI file
                        "uid": "11448", // -- " --
                        "amount": 1000000, // in INR
                        "branch_code": "00001", // same as in SBI file
                        "teller": "5899230", // -- " --
                        "status": "Paid", // Either "Paid" or "Expired"
                        "match": 1234 // matched recipient record index
                                      // i.e., the index into the data in recipients.json
                    }, ...]`}
                  </SyntaxHighlighter>
                  </TableCell>
                  <TableCell><a href="/donors.json">Download (JSON)</a><br/><a href="/donors.txt">Download (TXT)</a></TableCell>
                </TableRow>
                <TableRow>
                <TableCell>Recipients</TableCell>
                  <TableCell>
                  <SyntaxHighlighter language="json">
                    {`
                      [{
                        "match": 18871, // matched donor record index
                                        // i.e., the index into the data in donor.json
                        "serial_no": "1",
                        "redeem_date": "2019-04-12T03:30:00.000Z",
                        "recipient": "ALL INDIA ANNA DRAVIDA MUNNETRA KAZHAGAM", // aka "Name of the Political Party"
                        "account": "*******5199",
                        "prefix": "OC",
                        "uid": "775",
                        "amount": 10000000,
                        "branch_code": "00800",
                        "teller": "2770121"
                      }, ...]`}
                  </SyntaxHighlighter>
                  </TableCell>
                  <TableCell><a href="/recipients.json">Download (JSON)</a><br/><a href="/recipients.txt">Download (TXT)</a></TableCell>
                </TableRow>
                <TableRow>
                <TableCell>Matched and Summarized</TableCell>
                  <TableCell>
                  <SyntaxHighlighter language="json">
                    {`
                    {
                      "donors": {
                        "A B C INDIA LIMITED": {
                          "count": 13,
                          "total": 4000000,
                          "recipients": {
                            "BHARATIYA JANATA PARTY": {
                              "count": 13,
                              "total": 4000000
                            },
                            ...
                          }
                        }, ...
                      },
                      "recipients": {
                        "ALL INDIA ANNA DRAVIDA MUNNETRA KAZHAGAM": {
                          "count": 38,
                          "total": 60500000,
                          "donors": {
                            "Unknown": {
                              "count": 38,
                              "total": 60500000
                            },
                            ...
                          },
                          ...
                        },
                      }
                    `}
                  </SyntaxHighlighter>
                  </TableCell>
                  <TableCell><a href="/summary.json">Download (JSON)</a></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
      </Box>
    </div>
  );
}
