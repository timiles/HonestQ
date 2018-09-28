import { mount } from 'enzyme';
import 'jest';
import * as React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { combineReducers, createStore } from 'redux';
import { QuestionsListModel, TopicListItemModel, TopicsListModel } from '../../server-models';
import { reducers } from '../../store/index';
import Home from '../Home';

describe('components/Home', () => {

    it('renders', () => {

        const topic: TopicListItemModel = {
            name: 'Healthy eating',
            slug: 'Healthy_eating',
        };
        const question1 = {
            id: 1,
            text: 'Are toenails necessary?',
            slug: 'are_toenails_necessary',
            answersCount: 0,
            topics: [],
        };
        const question2 = {
            id: 2,
            text: 'Do I have to eat carbs?',
            slug: 'do_i_have_to_eat_carbs',
            answersCount: 3,
            topics: [topic],
        };
        const questionsList: QuestionsListModel = { questions: [question1, question2] };
        const topicsList: TopicsListModel = { topics: [topic] };

        const store = createStore(combineReducers(reducers));
        store.dispatch({ type: 'GET_QUESTIONS_LIST_SUCCESS', payload: questionsList });
        store.dispatch({ type: 'GET_TOPICS_LIST_SUCCESS', payload: topicsList });

        const wrapper = mount(<Provider store={store}><BrowserRouter><Home /></BrowserRouter></Provider>);

        const renderedQuestions = wrapper.find('.question-list-item').hostNodes();
        expect(renderedQuestions.length).toBe(2);
        expect(renderedQuestions.at(0).prop('href')).toBe('/questions/1/are_toenails_necessary');
        expect(renderedQuestions.at(0).find('.question').text()).toBe('Are toenails necessary?');
        expect(renderedQuestions.at(0).find('.badge').text()).toBe('0');
        expect(renderedQuestions.at(1).prop('href')).toBe('/questions/2/do_i_have_to_eat_carbs');
        expect(renderedQuestions.at(1).find('.question').text()).toBe('Do I have to eat carbs?');
        expect(renderedQuestions.at(1).find('.badge').text()).toBe('3');

        const renderedTopics = wrapper.find('.topic-list-item').hostNodes();
        expect(renderedTopics.length).toBe(1);
        expect(renderedTopics.at(0).prop('href')).toBe('/topics/Healthy_eating');
        expect(renderedTopics.at(0).text()).toBe('Healthy eating');
    });
});
