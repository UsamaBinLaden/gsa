/* Copyright (C) 2019-2020 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';
import {act} from 'react-dom/test-utils';

import {createRenewSessionQueryMock} from 'web/graphql/__mocks__/session';

import {fireEvent, rendererWith, screen, waitFor} from 'web/utils/testing';

import CvssCalculator from 'web/pages/extras/cvsscalculatorpage';

/* eslint-disable no-console */

// this is just a little hack to silence a warning that we'll get until we
// upgrade to 16.9: https://github.com/facebook/react/pull/14853
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (/Warning.*not wrapped in act/.test(args[0])) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

/* eslint-enable no-console */

const calculateScoreFromVector = jest.fn().mockReturnValue(
  Promise.resolve({
    data: 7.5,
  }),
);

const location = {
  query: {cvssVector: 'AV:N/AC:L/Au:N/C:P/I:P/A:P'},
};

const renewDate = '2019-10-10T12:00:00Z';

const [queryMock] = createRenewSessionQueryMock(renewDate);

const renewSession = jest.fn().mockResolvedValue({data: renewDate});
const gmp = {
  cvsscalculator: {
    calculateScoreFromVector,
  },
  settings: {
    manualUrl: 'http://docs.greenbone.net/GSM-Manual/gos-5/',
  },
  user: {
    renewSession,
  },
};

describe('CvssCalculator page tests', () => {
  test('Should render with default values', () => {
    const {render} = rendererWith({
      gmp,
      store: true,
      queryMocks: [queryMock],
    });

    const {element, getAllByTestId} = render(<CvssCalculator />);

    const input = getAllByTestId('select-selected-value');

    waitFor(() => element.querySelectorAll('input'));
    const vector = element.querySelectorAll('input');

    expect(input[0]).toHaveTextContent('Local');
    expect(input[1]).toHaveTextContent('Low');
    expect(input[2]).toHaveTextContent('None');
    expect(input[3]).toHaveTextContent('None');
    expect(input[4]).toHaveTextContent('None');
    expect(input[5]).toHaveTextContent('None');

    expect(vector[0]).toHaveAttribute('value', 'AV:L/AC:L/Au:N/C:N/I:N/A:N');
  });

  test('Should render userVector from url', () => {
    const {render} = rendererWith({
      gmp,
      store: true,
      queryMocks: [queryMock],
    });

    const {element, getAllByTestId} = render(
      <CvssCalculator location={location} />,
    );

    const input = getAllByTestId('select-selected-value');
    waitFor(() => element.querySelectorAll('input'));

    const vector = element.querySelectorAll('input');

    expect(input[0]).toHaveTextContent('Network');
    expect(input[1]).toHaveTextContent('Low');
    expect(input[2]).toHaveTextContent('None');
    expect(input[3]).toHaveTextContent('Partial');
    expect(input[4]).toHaveTextContent('Partial');
    expect(input[5]).toHaveTextContent('Partial');

    expect(vector[0]).toHaveAttribute('value', 'AV:N/AC:L/Au:N/C:P/I:P/A:P');
  });

  test('Changing userVector should change displayed select values', async () => {
    const {render} = rendererWith({
      gmp,
      store: true,
      queryMocks: [queryMock],
    });

    const {element, getAllByTestId} = render(
      <CvssCalculator location={location} />,
    );

    const vector = element.querySelectorAll('input');

    act(() => {
      fireEvent.change(vector[0], {
        target: {value: 'AV:N/AC:L/Au:N/C:N/I:P/A:P'},
      });
    });

    waitFor(() => getAllByTestId('select-selected-value'));
    const input = getAllByTestId('select-selected-value');

    expect(input[0]).toHaveTextContent('Network');
    expect(input[1]).toHaveTextContent('Low');
    expect(input[2]).toHaveTextContent('None');
    expect(input[3]).toHaveTextContent('None');
    expect(input[4]).toHaveTextContent('Partial');
    expect(input[5]).toHaveTextContent('Partial');

    expect(vector[0]).toHaveAttribute('value', 'AV:N/AC:L/Au:N/C:N/I:P/A:P');
  });

  test('Changing displayed select values should change userVector', async () => {
    const {render} = rendererWith({
      gmp,
      store: true,
      queryMocks: [queryMock],
    });

    const {element, getAllByTestId} = render(
      <CvssCalculator location={location} />,
    );

    const vector = element.querySelectorAll('input');

    const input = await screen.findAllByTestId('select-selected-value');

    expect(input[0]).toHaveTextContent('Network');
    expect(input[1]).toHaveTextContent('Low');
    expect(input[2]).toHaveTextContent('None');
    expect(input[3]).toHaveTextContent('Partial');
    expect(input[4]).toHaveTextContent('Partial');
    expect(input[5]).toHaveTextContent('Partial');

    expect(vector[0]).toHaveAttribute('value', 'AV:N/AC:L/Au:N/C:P/I:P/A:P');

    const selectFields = getAllByTestId('select-open-button');

    fireEvent.click(selectFields[0]);

    const selectItems = getAllByTestId('select-item');

    fireEvent.click(selectItems[0]);

    expect(vector[0]).toHaveAttribute('value', 'AV:L/AC:L/Au:N/C:P/I:P/A:P');
  });
});
