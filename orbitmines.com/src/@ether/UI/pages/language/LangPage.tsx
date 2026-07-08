import React from 'react';
import type {LangParams} from '../../router/types';
import LanguageList from './LanguageList';
import LanguageCreator from './LanguageCreator';

const LangPage: React.FC<{params: LangParams}> = ({params}) =>
  params.lang ? <LanguageCreator lang={params.lang} /> : <LanguageList />;

export default LangPage;
