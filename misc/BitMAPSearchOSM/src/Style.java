import java.awt.Color;
import java.awt.Container;
import java.awt.Font;
import javax.swing.JComponent;

/**
 * This class contains all methods to set the style of the UI elements. As all
 * elements are represented in the same font and colors, the same methods can be
 * called for each element.
 * 
 * @author Judith Höreth
 * 
 */
public class Style {

	void setColors(JComponent component) {
		component.setBackground(Color.BLACK);
		component.setForeground(Color.WHITE);
	}

	void setColors(Container container) {
		container.setBackground(Color.BLACK);
		container.setForeground(Color.WHITE);
	}

	void setFont(JComponent component, int size) {
		component.setFont(new Font("Gulim", Font.PLAIN, size));

	}
}
