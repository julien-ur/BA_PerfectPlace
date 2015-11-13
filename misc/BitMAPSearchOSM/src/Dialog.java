import java.awt.BorderLayout;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.image.BufferedImage;

import javax.swing.DefaultListModel;
import javax.swing.JButton;
import javax.swing.JDialog;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JList;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTextField;
import javax.swing.ListSelectionModel;
import javax.swing.border.EmptyBorder;
import javax.swing.event.ListSelectionEvent;
import javax.swing.event.ListSelectionListener;

/**
 * This class implements a custom dialog which is called with specific
 * parameters at different parts of the program.
 * 
 * @author Judith Höreth
 * 
 */

public class Dialog extends JDialog implements ActionListener,
		ListSelectionListener {

	private static final long serialVersionUID = 1L;
	JButton buttonPos, buttonNeg;
	int parameter = 0;
	BufferedImage img;
	Style style;
	JTextField tF;
	DefaultListModel<String> lM;
	JList<String> addressList;
	AppletValues appV;

	public Dialog(JFrame parent, String title, AppletValues appV) {
		super(parent, title, true);
		style = new Style();
		this.appV = appV;
	}

	private void createDialogUI(String message, String button1, String button2,
			int type) {
		JLabel newMessage = new JLabel("<html>" + message + "</html>");
		style.setColors(newMessage);
		newMessage.setBorder(new EmptyBorder(20, 20, 20, 20));
		style.setFont(newMessage, 16);
		getContentPane().add(newMessage, BorderLayout.NORTH);
		if (type == Values.DIALOG_WITH_TEXTFIELD) {
			tF = new JTextField();
			tF.setMinimumSize(new Dimension(50, 20));
			getContentPane().add(tF, BorderLayout.CENTER);
		} else if (type == Values.DIALOG_WITH_LIST) {
			lM = new DefaultListModel<String>();
			for (int i = 0; i < appV.getAddressList().size(); i++) {
				lM.addElement(appV.getAddressList().get(i));
			}
			addressList = new JList<String>(lM);
			addressList.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
			addressList.setLayoutOrientation(JList.VERTICAL);
			addressList.setVisibleRowCount(-1);
			addressList.setBorder(new EmptyBorder(10, 10, 10, 10));
			JScrollPane listScroller = new JScrollPane(addressList);
			listScroller.setPreferredSize(new Dimension(250, 80));
			addressList.addListSelectionListener(this);
			style.setColors(addressList);
			style.setFont(addressList, 12);
			getContentPane().add(addressList, BorderLayout.CENTER);
		}
		getContentPane().add(createButtonPane(button1, button2),
				BorderLayout.SOUTH);
		style.setColors(getContentPane());
		setDefaultCloseOperation(DISPOSE_ON_CLOSE);
		pack();
		setPosition();
		setVisible(true);
	}

	private JPanel createButtonPane(String button1, String button2) {
		JPanel buttonPane = new JPanel();
		buttonPane.setLayout(new FlowLayout());
		style.setColors(buttonPane);
		if (button1 != null) {
			buttonPos = new JButton(button1);
			style.setFont(buttonPos, 20);
			buttonPane.add(buttonPos);
			buttonPos.addActionListener(this);
			if (addressList != null) {
				buttonPos.setEnabled(false);
			}
		}
		if (button2 != null) {
			buttonNeg = new JButton(button2);
			style.setFont(buttonNeg, 20);
			buttonPane.add(buttonNeg);
			buttonNeg.addActionListener(this);
		}
		return buttonPane;
	}

	private void setPosition() {
		setLocation((int) (Values.WINDOW_WIDTH / 2 - getSize().width / 2),
				(int) (Values.WINDOW_HEIGHT / 2 - getSize().height / 2));
	}

	public void actionPerformed(ActionEvent e) {
		if (e.getSource() == buttonPos) {
			setParameter(Values.POSITIVE);
		} else {
			setParameter(Values.NEGATIVE);
		}
		setVisible(false);
		dispose();
	}

	private void setParameter(int parameter) {
		this.parameter = parameter;
	}

	int getParameter() {
		return parameter;
	}

	String getCustomParameterName() {
		String name = tF.getText();
		return name;
	}

	void show(String message, String button1, String button2, int type) {
		createDialogUI(message, button1, button2, type);
	}

	@Override
	public void valueChanged(ListSelectionEvent e) {
		if (e.getValueIsAdjusting() == false) {

			if (addressList.getSelectedIndex() == -1) {
				buttonPos.setEnabled(false);

			} else {
				buttonPos.setEnabled(true);
				appV.setSelectedAddress(addressList.getSelectedIndex());
			}
		}
	}

}
