import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.util.ArrayList;

import org.opencv.core.Core;
import org.opencv.core.Mat;
import org.opencv.core.Size;
import org.opencv.imgproc.Imgproc;

/**
 * This class contains a method to operate the blur filter on the calculated results.
 * Additionally there is a method to calculate and save the best-region points
 * in the map.
 * 
 * @author Judith Höreth
 * 
 */
public class Filter {
	ImgMatConverter matImg;
	AppletValues appV;
	ArrayList<Integer[]> bestMatch;

	public Filter(AppletValues appV) {
		matImg = new ImgMatConverter();
		this.appV = appV;
	}

	/**
	 * This method operates the blur filter used in the program. Before
	 * filtering, the bufferedImages are converted into Mat-objects. At the end,
	 * they mat-objects are reconverted into bufferedImage, so that they can be
	 * drawn in the applet.
	 * 
	 * @param layer
	 *            The layer used for the process
	 * @param blurValue
	 *            The value which defines the size of the blur-matrix
	 * 
	 */
	void filterNow(BufferedImage layer, int blurValue) {
		System.loadLibrary(Core.NATIVE_LIBRARY_NAME);
		Graphics2D g2d = (Graphics2D) layer.createGraphics();
		Mat source = matImg.bufferedImg2Mat(layer);
		Mat destination = new Mat(source.rows(), source.cols(), source.type());
		Imgproc.GaussianBlur(source, destination,
				new Size(blurValue, blurValue), -15, -15,
				Imgproc.BORDER_REPLICATE);
		BufferedImage dest = matImg.mat2Img(destination);
		g2d.drawImage(dest, 0, 0, Values.WIDTH, Values.HEIGHT, null);
	}

	/**
	 * Going through all the pixel of the given layer, the method finds the
	 * brightest pixel which represent the "best match". The limits for the
	 * "best match" and "second match" are defined with regard to the chosen
	 * number of amenities. The method walks through each pixel and checks,
	 * whether the grayscale-value is bigger than one of the calculated limits.
	 * If the pixel is bigger than the best-match-value, it is painted in
	 * strong red and saved to a list. If the pixel is smaller than the
	 * best-match-value, but bigger than the second-match-value, the pixel is
	 * painted in a lighter red. If the pixel is within the area of the
	 * third-match-value, it is painted in light red. The best-match-ArrayList
	 * is returned to use it to show houses in this area.
	 * 
	 * @param layer
	 *            used for process (to get the best region of the whole query,
	 *            the layerAll-layer, which contains all layers, is used).
	 * @param queryCount
	 *            number of chosen amenities for the query
	 * @param countImportance
	 *            number of all chosen important-values
	 * @return List with all pixel, which have a grey-value brighter then the
	 *         particular limit
	 */
	public ArrayList<Integer[]> getBestRegion(BufferedImage layer,
			int queryCount, int[] countImportance) {
		LimitValues lV = new LimitValues(0, 0, 0, appV);
		lV.setLimitValues(queryCount, countImportance);
		ArrayList<Integer[]> bestMatch = new ArrayList<Integer[]>();
		Graphics2D g2d = (Graphics2D) layer.createGraphics();
		for (int i = 0; i < Values.WIDTH; i++) {
			for (int j = 0; j < Values.HEIGHT; j++) {
				Color c = new Color(layer.getRGB(i, j));
				if (c.getRed() > lV.getLimitBestMatch()) {
					layer.setRGB(i, j, new Color(255, 0, 0).getRGB());
					bestMatch.add(new Integer[] { i, j });
				} else if (c.getRed() <= lV.getLimitBestMatch()
						&& c.getRed() > lV.getLimitSecondMatch()) {
					layer.setRGB(i, j, new Color(150, 0, 0).getRGB());
				} else if (c.getRed() <= lV.getLimitSecondMatch()
						&& c.getRed() > lV.getLimitThirdMatch()) {
					layer.setRGB(i, j, new Color(70, 0, 0).getRGB());
				}
			}
		}
		g2d.drawImage(layer, 0, 0, Values.WIDTH, Values.HEIGHT, null);
		return bestMatch;
	}

	void setBestMatch(Integer[] newBestMatch) {
		bestMatch.add(newBestMatch);
	}
}
