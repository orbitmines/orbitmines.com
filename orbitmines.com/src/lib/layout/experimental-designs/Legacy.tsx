import {Button, Card, Divider, Elevation, Icon, Navbar, Spinner, Text} from '@blueprintjs/core';
import React, {Fragment} from 'react';
import Grid from '../flexbox/Grid';
import Row from "../flexbox/Row";
import Col from "../flexbox/Col";
import logo from "../../../lib/organizations/orbitmines/logo/orbitmines.logo.3000x1000.png";

const Legacy = () => {
  return <Grid fluid style={{width: '100vw', height: '100vh'}}>
    <Row center="xs" middle="xs" style={{height: '100vh'}}>
      <Grid fluid className="full-width">
        <Row center="xs" middle="xs">
          <Col>
            <div style={{width: '400px'}}>
              <img src={logo} alt="logo" style={{maxWidth: '400px', width: '90%'}}/>
            </div>
          </Col>
          <Col>
            <div className="mx3">
              <Divider style={{backgroundColor: 'white', height: '40px'}}/>
            </div>
          </Col>
          <Col className="pl-6">

            <p style={{textAlign: 'left'}}>A tool for exploration ...</p>

            <p className="pt1" style={{textAlign: 'left', color: 'gray'}}>@OrbitMines community</p>

          </Col>
        </Row>

        <Row center="xs">
          <p style={{textAlign: 'left', color: 'gray', fontSize: '2em'}}>Install Wizard</p>
        </Row>

        <Row className="mt3" center="xs">
          <Col xs={4}>
            <Grid fluid>
              {[
                {name: "OrbitMines Explorer", selected: true},
                {name: "UI Design", selected: false},
                {name: "Sigurd Pentesting", selected: false},
                {name: "Self-managed Server", selected: false}
              ].map(item =>
                <Row>
                  <div style={{border: item.selected ? "2px white solid" : "none", borderRadius: '3px'}} className="w100">
                    <Grid fluid>
                      <Row middle="xs">
                        <Col xs={10}>
                          <div className="px2 py1">
                            <p style={{textAlign: 'left'}}>{item.name}</p>
                          </div>
                        </Col>
                        <Col xs={2}>
                          {item.selected ? <Spinner size={20}/> : <Icon icon="tick" intent="success"/>}
                        </Col>
                      </Row>
                    </Grid>
                  </div>
                </Row>
              )}
              <Row center="xs">
                <Icon icon="caret-down"/>
              </Row>
            </Grid>
          </Col>
          <Col xs={5}>
            <Grid fluid>
              <Row>
                <p style={{textAlign: 'left'}}>Quick description of service and the purpose. Probably just to install the main requirements.</p>
              </Row>
              <Row end="xs" className="pt2">
                <Col>
                  <Button text="Install [enter]" icon="import"/>
                </Col>
              </Row>
            </Grid>
          </Col>
        </Row>
      </Grid>


      {/*<Grid fluid>*/}
      {/*  <Row center="xs" middle="xs">*/}
      {/*    <div style={{width: '250px'}}>*/}
      {/*      /!*<img src="/rob_1000x1000.png" width="100%"}/>*!/*/}
      {/*    </div>*/}
      {/*  </Row>*/}
      {/*  <Row center="xs" middle="xs">*/}
      {/*    <Spinner intent="danger"/>*/}
      {/*  </Row>*/}
      {/*  <Row center="xs" middle="xs">*/}
      {/*    <p className="py1" style={{textAlign: 'center'}}>Establishing connection...</p>*/}
      {/*  </Row>*/}

      {/*  <Row center="xs" middle="xs">*/}
      {/*    /!*<Table items={this.state?.items ?? []}/>*!/*/}
      {/*  </Row>*/}
      {/*</Grid>*/}
      {/*<Grid className="full-height">*/}
      {/*  <Grid>*/}
      {/*    <Grid>*/}
      {/*      <Grid>*/}
      {/*        <div style={{width: '100px'}}>*/}
      {/*          /!*<img src="/rob_1000x1000.svg" width="100%"/>*!/*/}
      {/*        </div>*/}
      {/*      </Grid>*/}
      {/*      <Grid>*/}
      {/*        <Text style={{textAlign: "center"}}>*/}
      {/*          <h1>Select workspace</h1>*/}
      {/*        </Text>*/}
      {/*      </Grid>*/}
      {/*    </Grid>*/}
      {/*  </Grid>*/}
      {/*  <Grid>*/}
      {/*    <Grid>*/}
      {/*      {[*/}
      {/*        {*/}
      {/*          name: "ROBERT",*/}
      {/*          last_activity_at: '1 day ago',*/}
      {/*          screenshot: ''*/}
      {/*        },*/}
      {/*        {*/}
      {/*          name: "Ruby SEXP to instruction tree",*/}
      {/*          last_activity_at: '1 week ago'*/}
      {/*        },*/}
      {/*        {*/}
      {/*          name: "Robert: Docker functionality",*/}
      {/*          last_activity_at: '1 month ago'*/}
      {/*        }*/}
      {/*      ].map(workspace =>*/}
      {/*        <Grid>*/}
      {/*          <Card interactive={true} elevation={Elevation.ONE}>*/}
      {/*            <div style={{width: '200px'}}>{workspace.screenshot}</div>*/}
      {/*            <h5><a href="#">{workspace.name}</a></h5>*/}
      {/*            <p>{workspace.last_activity_at}</p>*/}
      {/*          </Card>*/}
      {/*        </Grid>*/}
      {/*      )}*/}
      {/*    </Grid>*/}
      {/*  </Grid>*/}
      {/*</Grid>*/}
    </Row>

    <Row>
      <Col>
        <Fragment>
          <Text>Robert 2020.10.03-002</Text>
          <Text>OS/ {window.navigator.platform}</Text>
        </Fragment>
      </Col>
    </Row>
  </Grid>
};

export default Legacy;