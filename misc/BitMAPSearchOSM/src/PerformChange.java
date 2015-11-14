import javax.swing.JCheckBox;
import javax.swing.JSlider;

/**
 * 
 * This class is used to summarize the methods which perform the change actions
 * after an interaction of the user with an element of the User Interface. In
 * this case it treats the interaction with the checkboxes which are selected or
 * deselected to choose an amenity as well as the sliders to choose a wished
 * distance an importance of this amenity.
 * 
 * @author Judith Höreth
 * 
 */
public class PerformChange {
	private UserInterface ui;
	private AppletValues appV;
	private ValueAttribution vA;

	public PerformChange(UserInterface ui, AppletValues appV,
			ValueAttribution vA) {
		this.ui = ui;
		this.appV = appV;
		this.vA = vA;
	}

	/**
	 * If the user selects or deselects a checkbox as a choice to add or remove
	 * an amenity of the current query, this action is saved and immediately
	 * implemented.
	 * 
	 * @param source
	 *            activated or deactivated checkbox
	 */
	void performCheckBoxChange(JCheckBox source) {
		appV.setLayerToRefresh(Integer.valueOf(source.getParent().getParent()
				.getParent().getName()));
		if (ui.getAllParameterPanels().get(appV.getLayerToRefresh())
				.isVisible() == true) {
			if (source.isSelected() == true) {
				appV.addToAllQueries((new String[] {
						vA.getQuery(source.getText()),
						String.valueOf(appV.getLayerToRefresh()) }));
				appV.getSelectedItems()[appV.getLayerToRefresh()] = ui
						.getAllComboboxes().get(appV.getLayerToRefresh())
						.getSelectedItem().toString();
			} else {
				for (int i = 0; i < appV.getAllQueries().size(); i++) {
					if (appV.getAllQueries().get(i)[0].equals(vA
							.getQuery(source.getText()))) {
						appV.removeFromAllQueries(i);
					}
				}
			}
		}
	}

	/**
	 * This method manages slider changes. First it checks, which of the two
	 * sliders is changed. In case of a change of the distance slider, the
	 * distance value as well as the blur value of the selected parameter are
	 * adapted to the chosen value. In the other case, the new importance value
	 * is saved for the chosen parameter.
	 * 
	 * @param source
	 *            JSlider which value is changed by the user
	 */
	void performSliderChange(JSlider source) {
		int pos = Integer.valueOf(source.getName());
		appV.setLayerToRefresh(pos / 2);
		int add = 0;
		if (!source.getValueIsAdjusting()) {
			if (pos % 2 == 0) {
				appV.setQueryValues(pos / 2, 0, source.getValue());
				if (source.getValue() % 2 == 0) {
					add = 1;
				}
				appV.setQueryValues(pos / 2, 2, Values.GAUSS_BLUR_VALUE
						* source.getValue() + add);
			} else {
				int oldImportance = appV.getQueryValues()[(pos - 1) / 2][1];
				appV.setQueryValues((pos - 1) / 2, 1, source.getValue());
				if (appV.getImportanceCount()[oldImportance] != 0) {
					appV.setImportanceCount(oldImportance,
							appV.getImportanceCount()[oldImportance] - 1);
				}
				appV.setImportanceCount(source.getValue(),
						appV.getImportanceCount()[source.getValue()] + 1);
			}
		}
	}
}
