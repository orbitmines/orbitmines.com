import React, {KeyboardEvent, useEffect} from 'react';
import {pageStyles} from "../../lib/paper/Paper";
import {useHotkeys} from "../../@orbitmines/js/react/hooks/useHotkeys";

const Chyp = () => {
  const hotkeys = useHotkeys();

  const env = new Environment();

  useEffect(() => {
    hotkeys.set({
      combo: ["tab", "ctrl + space"],
      label: "Completion",
      onKeyDown: (e) => {
        console.info('test')
      }
    }, {
      combo: ["shift + tab"],
      label: "",
      onKeyDown: (e) => e.preventDefault()
    },
    // { combo: [""], label: "New", onKeyDown: () => env.new() },
    { combo: ["ctrl + n"], label: "New", onKeyDown: () => env.next_rewrite() },
    { combo: ["ctrl + o"], label: "Open", onKeyDown: () => env.open() },
    // { combo: ["ctrl + f4", "ctrl + w"], label: "", onKeyDown: () => env.close_tab() }, TODO: Cant overwrite ctrl w
    { combo: ["ctrl + s"], label: "Save", onKeyDown: () => env.save() },
    { combo: ["ctrl + shift + s"], label: "Save As", onKeyDown: () => env.save_as() },
    { combo: ["ctrl + q"], label: "Quit", onKeyDown: () => env.quit() },
    { combo: ["ctrl + z", "alt + backspace", "f14"], label: "Undo", onKeyDown: () => env.undo() },
    { combo: ["ctrl + y", "shift + ctrl + z", "alt + shift + backspace"], label: "Redo", onKeyDown: () => env.redo() },
    // { combo: ["f4"], label: "Show Errors", onKeyDown: () => env.show_errors() },
    { combo: ["ctrl + enter"], label: "Add Rewrite Step", onKeyDown: () => env.add_rewrite_step() },
    { combo: ["ctrl + shift + enter"], label: "Repeat Rewrite Step", onKeyDown: () => env.repeat_rewrite_step() },
    { combo: ["ctrl + n"], label: "Next Rewrite", onKeyDown: () => env.next_rewrite() },
    { combo: ["ctrl + j"], label: "Next Part", onKeyDown: () => env.next_part() },
    { combo: ["ctrl + k"], label: "Previous Part", onKeyDown: () => env.previous_part() },
    { combo: ["ctrl + ]"], label: "Next Tab", onKeyDown: () => env.next_tab() },
    { combo: ["ctrl + ["], label: "Previous Tab", onKeyDown: () => env.previous_tab() },
    { combo: [], label: "Go To Import", onKeyDown: () => env.goto_import() },
    )
  }, []);

  return (
    <div style={{
      ...pageStyles
    }} tabIndex={0} onKeyDown={(e) => {

    }}>
    </div>
  );
};

class Environment {
  new = () => {}
  open = () => {}
  close_tab = () => {}
  previous_tab = () => {}
  next_tab = () => {}
  save = () => {}
  save_as = () => {}
  quit = () => {}
  undo = () => {}
  redo = () => {}
  show_errors = () => {}
  add_rewrite_step = () => {}
  repeat_rewrite_step = () => {}
  next_rewrite = () => {}
  next_part = () => {}
  previous_part = () => {}
  goto_import = () => {}
}

export default Chyp;