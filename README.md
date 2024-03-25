# Visualizing Electoral Bonds Data

The Election COmmission of India (ECI) released details of Electoral Bonds as ordered by the Supreme Court on 21st March 2024.  The data is available at [ECI website](https://eci.gov.in/files/file/13012-electoral-bonds-2018-19/). The data is available in two files, one for donors and the other for recipients.  The data is available in PDF format and is not machine readable.  The data is extracted from the PDF files and saved as text files.

1. Raw files from the EC are saved as (`data/donors.txt`)[data/donors.txt] and (`data/recipients.txt`)[data/recipients.txt].
2. The script (`data/preproc.js`)[data/preproc.js] extracts the data from these text files and saves them in json format under (`public/donors.json`)[public/donors.json] and (`public/recipients.json`)[public/recipients.json].
3. This in turn is used in (`components/sankey.js`)[components/sankey.js] to visualize the data

## Development Flow

```

npm install
node data/preproc.js
npm run dev
    
```

## Deployment

The repo can be (and is) directly deployed as a hobby project on vercel.  (https://electoral-bonds.vercel.app/)[https://electoral-bonds.vercel.app/]

