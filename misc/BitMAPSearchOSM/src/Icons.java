import java.awt.geom.GeneralPath;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import javax.imageio.ImageIO;

/**
 * This class manages the drawing of the amenity icons.
 * 
 * @author Judith Höreth
 * 
 */

public class Icons {

	public Icons() {
	}

	/**
	 * Depending on the given String, which represents the relative query, the
	 * matching icon is fetched from a list which contains the paths of all
	 * icons.
	 * 
	 * @param icon
	 *            String which represents the actual amenity
	 * @return matching icon
	 */
	BufferedImage getIcon(String icon) {
		BufferedImage img = null;
		String iconToGet = "";
		if (icon != null) {
			for (int i = 0; i < QueryValues.ALL_QUERIES.length; i++) {
				for (int j = 0; j < QueryValues.ALL_QUERIES[i].length; j++) {
					if (QueryValues.ALL_QUERIES[i][j].equals(icon)
							|| QueryValues.ALL_QUERIES[i][j].contains(icon)) {
						iconToGet = QueryValues.ALL_ICONS[i][j];
					}
				}
			}
		}
		try {
			img = ImageIO.read(new File("Icons/" + iconToGet));
		} catch (IOException e) {
			System.out.println("problem with icon");
		}
		return img;
	}

	/**
	 * This method checks if, the calculated position of the icon is within the
	 * polyline, which describes the amenity. Normally, the position of the icon
	 * can be calculated by the average of the maximum and minimum values of X
	 * and Y. If the amenity is described by a concave polygon, this basic
	 * calculation can be wrong. To prevent a wrong display of the icons, each
	 * of them is checked and - if the polyline not contains the position of the
	 * icon - that position has to be adapted by increasing or decreasing the X
	 * respectively the Y value.
	 * 
	 * @param polyline
	 *            the shape which represents the amenity
	 * @param x
	 *            the current X value of the icon
	 * @param y
	 *            the current Y value of the icon
	 * @return the new position of the icon (or the old one, if it is within the
	 *         polyline)
	 */
	float[] checkPosition(GeneralPath polyline, float x, float y) {
		boolean inPolygon = false;
		float tempX = x;
		if (!polyline.contains(x, y)) {
			if (tempX < polyline.getBounds().x) {
				while (tempX < Values.WIDTH && inPolygon == false) {
					if (polyline.contains(tempX, y)) {
						inPolygon = true;
						x = tempX;
						break;
					}
					tempX++;
				}
			} else {
				while (tempX > 0 && inPolygon == false) {
					if (polyline.contains(tempX, y)) {
						inPolygon = true;
						x = tempX;
						break;
					}
					tempX--;
				}
			}
		}
		if (inPolygon = true) {
			float[] newPosition = new float[] { x, y };
			return newPosition;
		} else {
			return checkPositionY(polyline, x, y);
		}
	}

	float[] checkPositionY(GeneralPath polyline, float x, float y) {
		boolean inPolygon = false;
		float tempY = y;
		if (!polyline.contains(x, y)) {
			if (tempY <= polyline.getBounds().y) {
				inPolygon = false;
				while (tempY < Values.HEIGHT && inPolygon == false) {
					if (polyline.contains(x, tempY)) {
						inPolygon = true;
						y = tempY;
						break;
					}
					tempY++;
				}
			} else {
				inPolygon = false;
				while (tempY > 0 && inPolygon == false) {
					;
					if (polyline.contains(x, tempY)) {
						inPolygon = true;
						y = tempY;
						break;
					}
					tempY--;
				}
			}
		}
		float[] newPosition = new float[] { x, y };
		return newPosition;
	}
}
