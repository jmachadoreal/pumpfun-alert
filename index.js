#!/usr/bin/env node

import { render } from "ink";
import React from "react";
import App from "./app/App.js";

/**
 * PumpFun Alert - CLI para monitoramento de tokens na PumpFun
 * Aplicação que utiliza React Ink para criar uma interface amigável
 * no terminal para monitorar lançamentos de tokens
 */

// Renderiza o aplicativo no terminal
render(React.createElement(App));
