import java.awt.AlphaComposite;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import javax.swing.JLabel;

/**
 * To be able to use and adapt the overlays within a Java Swing environment,
 * they are represented by JLabels. This class is used to create such Labels for
 * the given overlay.
 * 
 * @author Judith Höreth
 * 
 */
public class OverlayLabel extends JLabel {

	private static final long serialVersionUID = 1L;
	BufferedImage icon;
	float transparency;

	public OverlayLabel(BufferedImage icon, float transparency) {
		this.icon = icon;
		this.transparency = transparency;
	}

	void setLayer(BufferedImage icon) {
		this.icon = icon;
		repaint();
	}

	public void paintComponent(Graphics g) {
		Graphics2D g2d = (Graphics2D) g;
		AlphaComposite ac1 = AlphaComposite.getInstance(
				AlphaComposite.SRC_OVER, transparency);
		g2d.setComposite(ac1);
		g2d.drawImage(icon, 0, 0, null);
	}
}
