package com.reax.datamodel;

import org.nustaq.kontraktor.annotations.GenRemote;
import org.nustaq.reallive.Record;

/**
 * Created by ruedi on 27.10.14.
 */
@GenRemote
public class TestRecord extends Record {

    String name;
    String other;
    int x, y, z;

    public TestRecord init(String name, String other, int x, int y, int z) {
        this.name = name;
        this.other = other;
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getOther() {
        return other;
    }

    public void setOther(String other) {
        this.other = other;
    }

    public int getX() {
        return x;
    }

    public void setX(int x) {
        this.x = x;
    }

    public int getY() {
        return y;
    }

    public void setY(int y) {
        this.y = y;
    }

    public int getZ() {
        return z;
    }

    public void setZ(int z) {
        this.z = z;
    }
}
