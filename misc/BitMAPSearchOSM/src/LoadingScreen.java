import java.awt.AlphaComposite;
import java.awt.Color;
import java.awt.Component;
import java.awt.Container;
import java.awt.Dimension;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.event.MouseEvent;
import java.awt.event.MouseListener;

import javax.swing.BoxLayout;
import javax.swing.ImageIcon;
import javax.swing.JComponent;
import javax.swing.JLabel;
import javax.swing.JProgressBar;
import javax.swing.border.EmptyBorder;

/**
 * This class implements the LoadingScreen which is used as a GlassPane to
 * display a feedback to the user while processing. It can be constructed at
 * different parts of the program.
 * 
 * @author Judith Höreth
 * 
 */
public class LoadingScreen extends JComponent implements MouseListener {
	private static final long serialVersionUID = 1L;
	JProgressBar progress;
	JLabel loading, progressText;
	Style style;
	Container contentPane;

	public LoadingScreen(Container contentPane) {
		this.contentPane = contentPane;
		setLayout(new BoxLayout(this, BoxLayout.Y_AXIS));
		style = new Style();
		this.setBorder(new EmptyBorder(100, 0, 0, 0));
		createScreenUI();
		this.addMouseListener(this);
	}

	private void createScreenUI() {
		loading = new JLabel(new ImageIcon("ajax-loader.gif"));
		progressText = new JLabel();
		style.setFont(progressText, 30);
		progressText.setForeground(new Color(0xC2D2F6));
		progressText.setMinimumSize(new Dimension(600, 100));
		progressText.setBorder(new EmptyBorder(10, 0, 10, 0));
		progress = new JProgressBar();
		progress.setPreferredSize(new Dimension(400, 100));
		progress.setForeground(new Color(0xC2D2F6));
		progress.setBackground(Color.BLACK);
	}

	public void paintComponent(Graphics g) {
		Graphics2D g2d = (Graphics2D) g;
		AlphaComposite ac1 = AlphaComposite.getInstance(
				AlphaComposite.SRC_OVER, 0.5f);
		g2d.setComposite(ac1);
		g2d.setColor(Color.BLACK);
		g2d.fillRect(0, 0, Values.WINDOW_WIDTH, Values.WINDOW_HEIGHT);
		AlphaComposite ac2 = AlphaComposite.getInstance(
				AlphaComposite.SRC_OVER, 1);
		g2d.setComposite(ac2);
		loading.setAlignmentX(Component.CENTER_ALIGNMENT);
		progressText.setAlignmentX(Component.CENTER_ALIGNMENT);
		progress.setAlignmentX(Component.CENTER_ALIGNMENT);
		this.add(loading);
		this.add(progressText);
		this.add(progress);
	}

	void setProgressBar(int i, String s) {
		progress.setValue(i);
		progressText.setText(s);
		repaint();
	}

	@Override
	public void mouseClicked(MouseEvent e) {
		dispatchEvent(e);

	}

	@Override
	public void mouseEntered(MouseEvent e) {
		dispatchEvent(e);

	}

	@Override
	public void mouseExited(MouseEvent e) {
		dispatchEvent(e);
	}

	@Override
	public void mousePressed(MouseEvent e) {
		dispatchEvent(e);

	}

	@Override
	public void mouseReleased(MouseEvent e) {
		dispatchEvent(e);

	}

	private void dispatchEvent(MouseEvent e) {
	}
}
