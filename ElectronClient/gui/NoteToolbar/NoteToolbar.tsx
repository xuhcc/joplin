import * as React from 'react';
import { useEffect, useCallback, useState } from 'react';
import CommandService from 'lib/services/CommandService';
import ToolbarBase from '../ToolbarBase';
import { utils as pluginUtils } from 'lib/services/plugins/reducer';
import ToolbarButtonUtils, { ToolbarButtonInfo } from 'lib/services/commands/ToolbarButtonUtils';
import stateToWhenClauseContext from 'lib/services/commands/stateToWhenClauseContext';
const { connect } = require('react-redux');
const { buildStyle } = require('lib/theme');

interface ButtonClickEvent {
	name: string,
}

interface NoteToolbarProps {
	themeId: number,
	style: any,
	note: any,
	onButtonClick(event:ButtonClickEvent):void,
	noteAutoSave: boolean,
	toolbarButtonInfos: ToolbarButtonInfo[],
}

function styles_(props:NoteToolbarProps) {
	return buildStyle('NoteToolbar', props.themeId, (theme:any) => {
		return {
			root: {
				...props.style,
				borderBottom: 'none',
				backgroundColor: theme.backgroundColor,
			},
		};
	});
}

function NoteToolbar(props:NoteToolbarProps) {
	const styles = styles_(props);
	const [toolbarItems, setToolbarItems] = useState([]);

	const updateToolbarItems = useCallback(() => {
		const items = [...props.toolbarButtonInfos];

		if (props.noteAutoSave === false && props.note.hasChanged) {
			items.push({
				name: 'save',
				tooltip: 'Save',
				iconName: 'icon-save',
				// Use title because floppy disk icon is not available
				title: 'save',
				enabled: true,
				onClick: () => {
					props.onButtonClick({ name: 'saveNote' });
				},
			});
		}
		setToolbarItems(items);
	}, [props.note.id, props.note.body, props.note.hasChanged]);

	useEffect(() => {
		updateToolbarItems();
	}, [updateToolbarItems]);

	return <ToolbarBase style={styles.root} items={toolbarItems} />;
}

const toolbarButtonUtils = new ToolbarButtonUtils(CommandService.instance());

const mapStateToProps = (state:any) => {
	const whenClauseContext = stateToWhenClauseContext(state);

	return {
		noteAutoSave: state.settings['notes.autoSave'],
		toolbarButtonInfos: toolbarButtonUtils.commandsToToolbarButtons([
			'editAlarm',
			'toggleVisiblePanes',
			'showNoteProperties',
		].concat(pluginUtils.commandNamesFromViews(state.pluginService.plugins, 'noteToolbar')), whenClauseContext),
	};
};

export default connect(mapStateToProps)(NoteToolbar);
