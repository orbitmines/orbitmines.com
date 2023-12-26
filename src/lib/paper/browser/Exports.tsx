import {Children, value} from "../../typescript/React";
import {useLocation, useNavigate, useSearchParams} from "react-router-dom";
import React, {useCallback, useRef} from "react";
import {toJpeg} from "html-to-image";
import {Col, Row} from "../../layout/flexbox";
import {Button} from "@blueprintjs/core";
import {PaperProps, PaperThumbnail} from "../Paper";
import ReactDOM from "react-dom/client";

const Exports = (
  {paper, children}: { paper: PaperProps } & Children
) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const ref = useRef<any>(null);

  const generate = params.get('generate');
  const width = parseInt(params.get('width') ?? '1920');
  const height = parseInt(params.get('height') ?? '1080');

  const exportJpeg = useCallback(() => {
    if (ref === null)
      return;

    toJpeg(ref.current, {

      cacheBust: true, backgroundColor: '#1C2127' })
      .then((dataUrl) => {
        const link = document.createElement('a')

        link.download =
          generate === 'thumbnail'
            ? `${width}x${height}.jpeg`
            : `${value(paper.title).toLowerCase().replaceAll(" ", "-").replaceAll(",", "")}.jpeg`
        link.href = dataUrl
        link.click()
      })
      .catch((err) => {
        console.log(err)
      });
  }, [ref]);

  return <Row center="xs">
    {/* TODO: */}
    <Row between="xs" className="py-10 px-15" style={{width: '100%'}}>
      <Button icon="arrow-left" minimal onClick={() => navigate('/')} />

      <Col>
        {generate && ['button', 'thumbnail'].includes(generate) ? <>
         <Button text=".jpeg" icon="media" minimal onClick={exportJpeg} />
        </> : <>
          <a href={`${location.pathname.replace(/\/$/, "")}.jpeg`} target="_blank"><Button text=".jpeg" icon="media" minimal /></a>
          <a href={`${location.pathname.replace(/\/$/, "")}.pdf`} target="_blank"><Button text=".pdf" icon="document" minimal /></a>
        </>}
      </Col>
    </Row>
    <div ref={ref}>
      {children}
    </div>
  </Row>
}

export default Exports;
