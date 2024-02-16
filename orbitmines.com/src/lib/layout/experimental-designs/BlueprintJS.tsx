import React, {useState} from 'react';
import {
  Breadcrumb,
  BreadcrumbProps,
  Button,
  Callout,
  Classes,
  Code,
  Collapse,
  HotkeysProvider,
  Icon,
  Intent,
  Menu,
  MenuDivider,
  MenuItem,
  mergeRefs,
  Pre,
  ProgressBar,
  Props,
  Radio,
  RadioGroup,
  Spinner,
  Tag,
  Text,
} from "@blueprintjs/core";

import {
  Breadcrumbs,
  ContextMenu,
  ContextMenuChildrenProps,
  ContextMenuContentProps,
  Popover,
  ResizeSensor,
  Tooltip
} from "@blueprintjs/core";
import {ResizeObserverEntry} from "@juggle/resize-observer";
import classNames from "classnames";
// import {DateFormatProps, DateInput, DateRange, DateRangeInput, TimezoneSelect} from "@blueprintjs/datetime";
// import {format, isValid, parse} from "date-fns";
import {handleNumberChange} from "@blueprintjs/docs-theme";
// import {TimePrecision} from "@blueprintjs/datetime";
import {Cell, Table} from "@blueprintjs/table";

import Row from '../flexbox/Row';


const BREADCRUMBS: BreadcrumbProps[] = [
  { href: "/users", icon: "folder-close", text: "Users" },
  { href: "/users/janet", icon: "folder-close", text: "Janet" },
  { icon: "document", text: "image.jpg" },
];

// const locales: { [localeCode: string]: Locale } = require("date-fns/locale");
// export interface DateFormatSelectorProps {
//   /** Format options */
//   formatOptions: DateFormatProps[];
//
//   /** Selected formatter. */
//   format: DateFormatProps;
//
//   /**
//    * Optional label for the RadioGroup
//    *
//    * @default "Date format"
//    */
//   label?: React.ReactNode;
//
//   /** The callback to fire when a new formatter is chosen. */
//   onChange: (format: DateFormatProps) => void;
// }

// export const DateFormatSelector: React.FC<DateFormatSelectorProps> = props => {
//   const handleChange = handleNumberChange(index => {
//     props.onChange(props.formatOptions[index]);
//   });
//   const value = props.formatOptions.indexOf(props.format);
//
//   return (
//     <RadioGroup label={props.label ?? "Date format"} onChange={handleChange} selectedValue={value}>
//       {props.formatOptions.map((format, index) => (
//         <Radio key={index} label={format.placeholder} value={index} />
//       ))}
//     </RadioGroup>
//   );
// };

// export const DateFnsFormatSelector: React.FC<Omit<DateFormatSelectorProps, "formatOptions">> = props => {
//   return (
//     <DateFormatSelector
//       formatOptions={DATE_FNS_FORMATS}
//       label={
//         <span>
//                     <a href="https://date-fns.org/">date-fns</a> format
//                 </span>
//       }
//       {...props}
//     />
//   );
// };
//
// export const DATE_FNS_FORMATS: DateFormatProps[] = [
//   getDateFnsFormatter("MM/dd/yyyy"),
//   getDateFnsFormatter("yyyy-MM-dd"),
//   getDateFnsFormatter("yyyy-MM-dd HH:mm:ss"),
//   getDateFnsFormatter("LLL do, yyyy 'at' K:mm a"),
// ];
//
// function getDateFnsFormatter(formatStr: string): DateFormatProps {
//   return {
//     formatDate: (date: Date, localeCode: string) => format(date, formatStr, maybeGetLocaleOptions(localeCode!)),
//     parseDate: (str: string, localeCode: string) => parse(str, formatStr, new Date(), maybeGetLocaleOptions(localeCode!)),
//     placeholder: `${formatStr}`,
//   };
// }

// function maybeGetLocaleOptions(localeCode: string): { locale: any } | undefined {
//   if (locales[localeCode] !== undefined) {
//     return { locale: locales[localeCode] };
//   }
//   return undefined;
// }

const onResize = (entries: ResizeObserverEntry[]) => {
  console.log(entries.map(e => `${e.contentRect.width} x ${e.contentRect.height}`));
}
// const FORMAT = "EEEE, MMMM d, yyyy";
// const FORMAT_WITH_TIME = "MMMM d, yyyy 'at' K:mm a";

// export const DateFnsDate: React.FC<{ date: Date; formatStr?: string; withTime?: boolean }> = ({
//                                                                                                 date,
//                                                                                                 withTime = false,
//                                                                                                 formatStr = withTime ? FORMAT_WITH_TIME : FORMAT,
//                                                                                               }) => {
//   if (isValid(date)) {
//     return <Tag intent={Intent.PRIMARY}>{format(date, formatStr)}</Tag>;
//   } else {
//     return <Tag minimal={true}>no date</Tag>;
//   }
// };

// export const DateFnsDateRange: React.FC<{ range: DateRange; formatStr?: string; withTime?: boolean } & Props> = ({
//                                                                                                                    className,
//                                                                                                                    range: [start, end],
//                                                                                                                    withTime = false,
//                                                                                                                    formatStr = withTime ? FORMAT_WITH_TIME : FORMAT,
//                                                                                                                  }) => (
//   <div className={classNames("docs-date-range", className)}>
//     <DateFnsDate withTime={withTime} date={start!} formatStr={formatStr} />
//     <DateFnsDate withTime={withTime} date={end!} formatStr={formatStr} />
//   </div>
// );
function BlueprintJS() {

  const renderContent = React.useCallback(
    ({ targetOffset }: ContextMenuContentProps) => (
      <Menu>
        <MenuItem icon="select" text="Select all" />
        <MenuItem icon="insert" text="Insert...">
          <MenuItem icon="new-object" text="Object" />
          <MenuItem icon="new-text-box" text="Text box" />
          <MenuItem icon="star" text="Astral body" />
        </MenuItem>
        <MenuItem icon="layout" text="Layout...">
          <MenuItem icon="layout-auto" text="Auto" />
          <MenuItem icon="layout-circle" text="Circle" />
          <MenuItem icon="layout-grid" text="Grid" />
        </MenuItem>
        {targetOffset === undefined ? undefined : (
          <>
            <MenuDivider />
            <MenuItem
              disabled={true}
              text={`Clicked at (${Math.round(targetOffset.left)}, ${Math.round(targetOffset.top)})`}
            />
          </>
        )}
      </Menu>
    ),
    [],
  );

  const children = React.useCallback(
    (props: ContextMenuChildrenProps) => (
      <div
        className={classNames("docs-context-menu-node", props.className, {
          "docs-context-menu-open": props.contentProps.isOpen,
        })}
        onContextMenu={props.onContextMenu}
        ref={props.ref}
      >
        {props.popover}
      </div>
    ),
    [],
  );

  const dollarCellRenderer = (rowIndex: number) => (
    <Cell>{`$${(rowIndex * 10).toFixed()}`}</Cell>
  );
  const euroCellRenderer = (rowIndex: number) => (
    <Cell>{`€${(rowIndex * 10 * 0.85).toFixed()}`}</Cell>
  );

  const [timezone, setTimezone] = useState("");
  const [date, setDate] = useState<string | null>(null);
  // const [range, setRange] = useState<DateRange>([null, null]);

  // document.write(svg);
  // document.write('<hr/><code>');
  // document.write(svg.replace(/</g, '&lt;')); //show raw xml in browser
  // document.write('</code><hr/>');

  return (
    <Row className="p-8 child-pb-4">

      <Row>
        {/*<CustomIcon icon="github" intent={Intent.DANGER} size={30}/>*/}
        {/*<CustomIcon icon="twitter" intent={Intent.DANGER} size={30}/>*/}
      </Row>
      <Row>
        {/* https://blueprintjs.com/docs/#core/components/callout */}
        <Callout title={"Visually important content"} intent={"danger"}>
          The component is a simple wrapper around the CSS API that provides props for modifiers and optional
          title element. Any additional HTML props will be spread to the rendered <Code>{"<div>"}</Code>{" "}
          element.
        </Callout>
      </Row>

      <Row>
        {/* https://blueprintjs.com/docs/#popover-package/breadcrumbs */}
        <Breadcrumbs
          currentBreadcrumbRenderer={({ text, ...restProps }: BreadcrumbProps) => {
            // customize rendering of last breadcrumb
            return <Breadcrumb {...restProps}>{text} <Icon icon="star" /></Breadcrumb>;
          }}
          items={BREADCRUMBS}
        />
      </Row>

      <Row>
        <Menu>
          <MenuItem text="See more">
            <MenuItem text="First submenu item" />
            <MenuItem text="Second submenu item" />
          </MenuItem>
        </Menu>
      </Row>

      <Row>
        <ResizeSensor onResize={onResize}>
          <div style={{ width: 400, backgroundColor: '#564A6' }}>asd</div>
        </ResizeSensor>
      </Row>

      <Row>
        <ContextMenu content={renderContent}>
          <Tooltip
            content={
              <div style={{ maxWidth: 30, textAlign: "center" }}>
                This tooltip will close when you open the node's context menu
              </div>
            }
          >

            <ContextMenu
              content={
                <Menu>
                  <MenuItem icon="search-around" text="Search around..." />
                  <MenuItem icon="search" text="Object viewer" />
                  <MenuItem icon="graph-remove" text="Remove" />
                  <MenuItem icon="group-objects" text="Group" />
                  <MenuDivider />
                  <MenuItem disabled={true} text="Clicked on node" />
                </Menu>
              }
            >
              {children}
            </ContextMenu>
          </Tooltip>
          <span className={Classes.TEXT_MUTED}>Right-click on node or background.</span>
        </ContextMenu>
      </Row>

      <Row>
        <Popover
          content={<h1>Popover!</h1>}
          renderTarget={({ isOpen: isPopoverOpen, ref: ref1, ...popoverProps }) => (
            <Tooltip
              content="I have a popover!"
              disabled={isPopoverOpen}
              openOnTargetFocus={false}
              renderTarget={({ isOpen: isTooltipOpen, ref: ref, ...tooltipProps }) => (
                <Button
                  {...popoverProps}
                  {...tooltipProps}
                  active={isPopoverOpen}
                  // elementRef={mergeRefs(ref1, ref)}
                  text="Hover and click me"
                />
              )}
            />
          )}
        />;

      </Row>
      {/*<TimezoneSelect value={timezone} onChange={setTimezone} />*/}
      {/*<TimezoneSelect value={timezone} onChange={setTimezone}>*/}
      {/*  <Icon icon="globe" />*/}
      {/*</TimezoneSelect>*/}

      <Row>
        {/*<DateRangeInput*/}
        {/*  value={range}*/}
        {/*  onChange={(range: DateRange) => setRange(range)}*/}
        {/*  {...DATE_FNS_FORMATS[0]}*/}
        {/*  footerElement={<Callout style={{ maxWidth: 460 }}>*/}
        {/*    A custom footer element may be displayed below the date range picker calendars using the{" "}*/}
        {/*    <Code>footerElement</Code> prop.*/}
        {/*  </Callout>}*/}
        {/*  timePickerProps={{ precision: TimePrecision.SECOND, showArrowButtons: true }}*/}
        {/*/>*/}
        {/*<DateFnsDateRange range={range} />*/}
      </Row>

      <Row>
        {/*<DateInput*/}
        {/*  {...DATE_FNS_FORMATS[0]}*/}
        {/*  onChange={(newDate: any, isUserChange: any) => setDate(newDate)}*/}
        {/*  popoverProps={{ placement: "bottom" }}*/}
        {/*  rightElement={*/}
        {/*    <Icon icon="globe" intent="primary" style={{ padding: 7, marginLeft: -5 }} />*/}
        {/*  }*/}
        {/*  timePickerProps={{ showArrowButtons: true, useAmPm: false }}*/}
        {/*  value={date}*/}
        {/*/>*/}
      </Row>

      <Row>
        <HotkeysProvider>
          <Table numRows={5}>
            {/*<Column name="Dollars" cellRenderer={dollarCellRenderer}/>*/}
            {/*<Column name="Euros" cellRenderer={euroCellRenderer} />*/}
          </Table>
        </HotkeysProvider>
      </Row>

      <Row>
        <div>
          <Button onClick={() => {}}>
            {true ? "Hide" : "Show"} build logs
          </Button>
          <Collapse isOpen={true}>
            <Pre>
              Dummy text.
            </Pre>
          </Collapse>
        </div>
      </Row>

      <Row>
        <ProgressBar intent={Intent.DANGER} value={0.5} animate={false} stripes={false} />
      </Row>

      <Row>
        {/* disbaled & tabIndex=-1 when using skeletoons */}
        <div className="bp4-card">
          <h5 className="bp4-heading"><a className={Classes.SKELETON} href="../../../../playground/interface/browser/src#" tabIndex={-1}>Card heading</a></h5>
          <p className={Classes.SKELETON}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque eget tortor felis.
            Fusce dapibus metus in dapibus mollis. Quisque eget ex diam.
          </p>
        </div>
      </Row>

      <Row>
        <Spinner intent={Intent.DANGER} value={0.1}/>
        <Spinner intent={Intent.WARNING} value={0.85} />
      </Row>

      <Row>
        <Tag intent={Intent.WARNING} multiline icon={<Icon icon="add-clip"/>}>Tag</Tag>
      </Row>

      <Row>
        <Text> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque eget tortor felis. Fusce dapibus metus in dapibus mollis. Quisque eget ex diam.</Text>
        <Text ellipsize={true} title="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque eget tortor felis. Fusce dapibus metus in dapibus mollis. Quisque eget ex diam."> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque eget tortor felis. Fusce dapibus metus in dapibus mollis. Quisque eget ex diam.</Text>
      </Row>

      <Row>

      </Row>

      <Row>

      </Row>

      <Row>

      </Row>

      <Row>

      </Row>
    </Row>
  );
}

export default BlueprintJS;