/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import glamorous from 'glamorous';

import {classes} from '../../utils.js';

import PropTypes from '../proptypes.js';

const Table = ({
    children,
    className,
    footer,
    header,
  }) => {

  className = classes(className, 'table');

  return (
    <table
      className={className}>
      {header}
      {children}
      <tfoot>
        {footer}
      </tfoot>
    </table>
  );
};

Table.propTypes = {
  header: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
  fixed: PropTypes.bool,
  footer: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
  className: PropTypes.string,
};

export default glamorous(Table)({
  border: 0,
  borderSpacing: '2px',
  fontSize: '12px',
  textAlign: 'left',
  width: '100%',

  '& th, & td': {
    padding: '4px',
  },

  '& tfoot tr': {
    background: '#DDDDDD',
  },

  '@media print': {
    borderCollapse: 'collapse',
  },
},
  props => ({tableLayout: props.fixed ? 'fixed' : 'auto'}),
);

// vim: set ts=2 sw=2 tw=80:
