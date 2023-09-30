import React from 'react';
import Exports from "../browser/Exports";
import {PaperProps} from "../Paper";
import PaperContent from "../PaperContent";

const Browser = ({ paper }: { paper: PaperProps }) => {
  return (
    <Exports paper={paper}>
      <PaperContent {...paper} />
    </Exports>
  );
};

export default Browser;