import { mount, ReactWrapper } from 'enzyme';
import 'jest';
import * as React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { combineReducers, createStore } from 'redux';
import { reducers } from '../../../store';
import QuestionForm from '../QuestionForm';

describe('components/QuestionForm', () => {

    function changeElement(wrapper: ReactWrapper, selector: string, value: string) {
        const element = wrapper.find(selector).hostNodes();
        element.simulate('change', { target: { name: element.prop('name'), value } });
    }

    it('submits', () => {

        const store = createStore(combineReducers(reducers));
        const mockSubmit = jest.fn();

        const wrapper = mount(
            <Provider store={store}>
                <BrowserRouter>
                    <QuestionForm submit={mockSubmit} />
                </BrowserRouter>
            </Provider>);

        changeElement(wrapper, '#questionText', 'How do we know the Earth is round?');
        changeElement(wrapper, '#questionSource', 'My mate says it is flat');

        wrapper.find('form').simulate('submit');

        expect(mockSubmit.mock.calls.length).toBe(1);
        const submittedForm = mockSubmit.mock.calls[0][0];
        expect(submittedForm.text).toBe('How do we know the Earth is round?');
        expect(submittedForm.source).toBe('My mate says it is flat');
        expect(submittedForm.topics.length).toBe(0);
    });
});
