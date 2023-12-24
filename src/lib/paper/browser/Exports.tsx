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
  const thumbnailRef = useRef<any>(null);

  const generate = params.get('generate');

  const exportJpeg = useCallback(() => {
    if (ref === null)
      return;

    toJpeg(ref.current, {

      cacheBust: true, backgroundColor: '#1C2127' })
      .then((dataUrl) => {
        const link = document.createElement('a')
        link.download = `${value(paper.title).toLowerCase().replaceAll(" ", "-").replaceAll(",", "")}.jpeg`
        link.href = dataUrl
        link.click()
      })
      .catch((err) => {
        console.log(err)
      });
  }, [ref]);

  const exportThumbnailJpeg = useCallback(({width, height}: { width: number, height: number}) => {
    if (ref === null)
      return;

    const root = ReactDOM.createRoot(thumbnailRef.current);
    root.render(<PaperThumbnail {...paper} size={{width, height}} />);

    console.log(thumbnailRef.current)

    setInterval(() => {
      toJpeg(thumbnailRef.current, {
        cacheBust: true, backgroundColor: '#1C2127'
      })
        .then((dataUrl) => {
          const link = document.createElement('a')
          link.download = `${width}x${height}.jpeg`
          link.href = dataUrl
          link.click()
        })
        .catch((err) => {
          console.log(err)
        });
    }, 1)
  }, [thumbnailRef]);

  return <Row center="xs">
    {/* TODO: */}
    <Row between="xs" className="py-10 px-15" style={{width: '100%'}}>
      <Button icon="arrow-left" minimal onClick={() => navigate('/')} />

      <Col>
        {generate === 'button' ? <>
          {[
            [3840, 2160],
            [1920, 1080],
          ].map(([width, height]) => (
            <Button text={`${width}x${height}.jpeg`} icon="media" minimal
                    onClick={() => exportThumbnailJpeg({width, height})}
            />
          ))}
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
    <div ref={thumbnailRef}>

    </div>
  </Row>
}

export default Exports;
